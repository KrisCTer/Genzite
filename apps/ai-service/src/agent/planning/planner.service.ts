import { Injectable, Logger } from '@nestjs/common';
import { GeminiClient } from '../../gemini/gemini.client.js';
import { ToolRegistry } from '../tools/tool.registry.js';
import type { ExecutionPlan, PlanStep, PlannerResponse } from './plan.interface.js';

const MAX_REPLAN_ATTEMPTS = 2;

const PLANNER_SYSTEM = `You are a Planning Agent for the Genzite no-code platform.
Your job is to break down complex user requests into a step-by-step execution plan.

Each step in the plan MUST use one of the available tools. Steps can depend on other steps
(the result of step A can be used as input for step B).

RULES:
1. Break complex tasks into the smallest logical steps.
2. Each step must reference an available tool by name in the "action" field.
3. Use "dependsOn" to declare which steps must finish first.
4. Step IDs should be simple: "step_1", "step_2", etc.
5. Params can reference previous step results using {{step_X.result}} syntax.
6. If the request is simple (single tool call), create a plan with just 1 step.
7. Always validate inputs — if required info is missing, add a step description noting what's needed.`;

@Injectable()
export class PlannerService {
  private readonly logger = new Logger(PlannerService.name);

  constructor(
    private readonly gemini: GeminiClient,
    private readonly toolRegistry: ToolRegistry,
  ) {}

  /**
   * Create and execute a plan for a complex goal.
   */
  async planAndExecute(goal: string, model?: string): Promise<PlannerResponse> {
    this.logger.log(`Planning goal: "${goal}" (model: ${model || 'default'})`);

    // Phase 1: Generate plan
    const plan = await this.generatePlan(goal, model);
    plan.status = 'executing';

    // Phase 2: Execute plan step by step
    await this.executePlan(plan, 0, model);

    // Phase 3: Generate summary
    const message = await this.generateSummary(plan, model);
    plan.summary = message;

    return { plan, message };
  }

  /**
   * Ask Gemini to create an execution plan from a goal.
   */
  private async generatePlan(goal: string, modelName?: string): Promise<ExecutionPlan> {
    const tools = this.toolRegistry.getAll();
    const toolDescriptions = tools
      .map((t) => `- ${t.declaration.name}: ${t.declaration.description ?? 'No description'}`)
      .join('\n');

    const prompt = `Create an execution plan for the following goal.

GOAL: "${goal}"

AVAILABLE TOOLS:
${toolDescriptions}

Return JSON:
{
  "goal": "the goal restated",
  "steps": [
    {
      "id": "step_1",
      "description": "what this step does",
      "action": "tool_name",
      "params": { "param1": "value1" },
      "dependsOn": []
    }
  ],
  "status": "planning"
}`;

    const plan = await this.gemini.generateJson<ExecutionPlan>(prompt, {
      systemInstruction: PLANNER_SYSTEM,
      temperature: 0.3,
      model: modelName as any,
    });

    // Ensure proper status
    plan.status = 'planning';
    for (const step of plan.steps) {
      step.status = 'pending';
    }

    this.logger.log(`Plan created: ${plan.steps.length} steps`);
    return plan;
  }

  /**
   * Execute plan steps in dependency order.
   * Re-plans remaining steps if a step fails.
   */
  private async executePlan(plan: ExecutionPlan, replanAttempt = 0, modelName?: string): Promise<void> {
    const maxIterations = plan.steps.length * 2; // safety limit
    let iterations = 0;

    while (iterations++ < maxIterations) {
      // Find next executable step (all deps done, status pending)
      const nextStep = plan.steps.find(
        (step) =>
          step.status === 'pending' &&
          step.dependsOn.every((depId) => {
            const dep = plan.steps.find((s) => s.id === depId);
            return dep?.status === 'done';
          }),
      );

      if (!nextStep) {
        // No more executable steps — check if we're done or stuck
        const hasPending = plan.steps.some((s) => s.status === 'pending');
        if (hasPending) {
          // Stuck: some steps can never run (circular deps or failed deps)
          this.skipUnreachableSteps(plan);
        }
        break;
      }

      // Resolve parameter references like {{step_1.result}}
      const resolvedParams = this.resolveParams(nextStep.params, plan.steps);

      nextStep.status = 'running';
      this.logger.log(`Executing step "${nextStep.id}": ${nextStep.description}`);

      try {
        nextStep.result = await this.toolRegistry.executeTool(nextStep.action, resolvedParams);
        nextStep.status = 'done';
        this.logger.log(`Step "${nextStep.id}" completed`);
      } catch (error) {
        nextStep.status = 'failed';
        nextStep.error = error instanceof Error ? error.message : 'Execution failed';
        this.logger.error(`Step "${nextStep.id}" failed: ${nextStep.error}`);

        // Attempt to re-plan remaining steps
        if (replanAttempt < MAX_REPLAN_ATTEMPTS) {
          this.logger.log(`Re-planning (attempt ${replanAttempt + 1}/${MAX_REPLAN_ATTEMPTS})...`);
          await this.replan(plan, nextStep, modelName);
          return this.executePlan(plan, replanAttempt + 1, modelName);
        }
      }
    }

    // Determine final status
    const hasFailure = plan.steps.some((s) => s.status === 'failed');
    plan.status = hasFailure ? 'failed' : 'completed';
  }

  /**
   * Re-plan: ask Gemini to replace remaining pending steps
   * given the current progress and failure context.
   */
  private async replan(plan: ExecutionPlan, failedStep: PlanStep, modelName?: string): Promise<void> {
    const completedSteps = plan.steps
      .filter((s) => s.status === 'done')
      .map((s) => `- ${s.id} (${s.action}): completed`)
      .join('\n');

    const tools = this.toolRegistry.getAll();
    const toolDescriptions = tools
      .map((t) => `- ${t.declaration.name}: ${t.declaration.description ?? ''}`)
      .join('\n');

    const prompt = `A plan step failed. Create replacement steps for the remaining work.

ORIGINAL GOAL: "${plan.goal}"
COMPLETED STEPS:
${completedSteps || '(none)'}

FAILED STEP: "${failedStep.id}" (${failedStep.action}) — Error: ${failedStep.error}

AVAILABLE TOOLS:
${toolDescriptions}

Return JSON with only the NEW replacement steps (don't repeat completed steps):
{
  "steps": [
    { "id": "replan_1", "description": "...", "action": "tool_name", "params": {}, "dependsOn": [] }
  ]
}`;

    try {
      const replanned = await this.gemini.generateJson<{ steps: PlanStep[] }>(prompt, {
        systemInstruction: PLANNER_SYSTEM,
        temperature: 0.3,
        model: modelName as any,
      });

      // Remove old pending steps and add new ones
      plan.steps = plan.steps.filter((s) => s.status !== 'pending');
      for (const newStep of replanned.steps) {
        newStep.status = 'pending';
        plan.steps.push(newStep);
      }

      this.logger.log(`Re-plan added ${replanned.steps.length} new steps`);
    } catch (error) {
      this.logger.error(`Re-planning failed: ${error}`);
    }
  }

  /**
   * Resolve {{step_X.result}} references in params.
   */
  private resolveParams(
    params: Record<string, unknown>,
    steps: PlanStep[],
  ): Record<string, unknown> {
    const resolved: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(params)) {
      if (typeof value === 'string') {
        resolved[key] = value.replace(/\{\{(\w+)\.result\}\}/g, (_match, stepId: string) => {
          const step = steps.find((s) => s.id === stepId);
          if (step?.result !== undefined) {
            return typeof step.result === 'string' ? step.result : JSON.stringify(step.result);
          }
          return `{{${stepId}.result}}`; // unresolved
        });
      } else {
        resolved[key] = value;
      }
    }

    return resolved;
  }

  /**
   * Mark unreachable steps (pending with failed/skipped deps) as skipped.
   */
  private skipUnreachableSteps(plan: ExecutionPlan): void {
    for (const step of plan.steps) {
      if (step.status !== 'pending') continue;

      const hasFailedDep = step.dependsOn.some((depId) => {
        const dep = plan.steps.find((s) => s.id === depId);
        return dep?.status === 'failed' || dep?.status === 'skipped';
      });

      if (hasFailedDep) {
        step.status = 'skipped';
        step.error = 'Skipped due to failed dependency';
        this.logger.warn(`Step "${step.id}" skipped (dependency failed)`);
      }
    }
  }

  /**
   * Generate a human-readable summary of the plan execution.
   */
  private async generateSummary(plan: ExecutionPlan, modelName?: string): Promise<string> {
    const stepSummaries = plan.steps
      .map((s) => {
        const statusEmoji = { done: '✅', failed: '❌', skipped: '⏭️', pending: '⏳', running: '🔄' };
        return `${statusEmoji[s.status]} ${s.description} (${s.action}) — ${s.status}`;
      })
      .join('\n');

    const prompt = `Summarize the execution of this plan in a helpful, concise way for the user.

GOAL: "${plan.goal}"
STATUS: ${plan.status}

STEPS:
${stepSummaries}

Write a brief summary (2-4 sentences) of what was accomplished.`;

    try {
      return await this.gemini.generateContent(prompt, { 
        temperature: 0.5, 
        maxOutputTokens: 512,
        model: modelName as any
      });
    } catch {
      return `Plan ${plan.status}. ${plan.steps.filter((s) => s.status === 'done').length}/${plan.steps.length} steps completed.`;
    }
  }
}
