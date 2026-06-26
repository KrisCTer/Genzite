import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import {
  type PipelineStep,
  type PipelineContext,
  type PipelineResult,
  type StepResult,
  isConditionalStep,
} from './pipeline.interface.js';

/**
 * Engine that executes a chain of PipelineSteps sequentially.
 * Supports conditional steps, timing, logging, and error handling.
 */
@Injectable()
export class PipelineRunner {
  private readonly logger = new Logger(PipelineRunner.name);

  /**
   * Run a pipeline — pass input through each step sequentially.
   * Output of step N becomes input of step N+1.
   */
  async run<TIn, TOut>(
    pipelineName: string,
    steps: PipelineStep[],
    input: TIn,
  ): Promise<PipelineResult<TOut>> {
    const runId = randomUUID();
    const context: PipelineContext = {
      variables: new Map(),
      logger: new Logger(`Pipeline:${pipelineName}`),
      runId,
    };

    const stepResults: StepResult[] = [];
    const pipelineStart = Date.now();
    let currentInput: unknown = input;

    this.logger.log(`[${runId}] Starting pipeline "${pipelineName}" with ${steps.length} steps`);

    for (const step of steps) {
      const stepStart = Date.now();

      // Check conditional step
      if (isConditionalStep(step)) {
        if (!step.shouldRun(currentInput, context)) {
          const skipped: StepResult = {
            stepName: step.name,
            status: 'skipped',
            durationMs: 0,
          };
          stepResults.push(skipped);
          context.logger.log(`Step "${step.name}" skipped (condition not met)`);
          continue;
        }
      }

      try {
        context.logger.log(`Step "${step.name}" starting...`);
        currentInput = await step.execute(currentInput, context);

        const result: StepResult = {
          stepName: step.name,
          status: 'completed',
          durationMs: Date.now() - stepStart,
        };
        stepResults.push(result);
        context.logger.log(`Step "${step.name}" completed in ${result.durationMs}ms`);
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        const result: StepResult = {
          stepName: step.name,
          status: 'failed',
          durationMs: Date.now() - stepStart,
          error: errorMsg,
        };
        stepResults.push(result);

        this.logger.error(`[${runId}] Pipeline "${pipelineName}" failed at step "${step.name}": ${errorMsg}`);
        throw error;
      }
    }

    const totalDurationMs = Date.now() - pipelineStart;
    this.logger.log(
      `[${runId}] Pipeline "${pipelineName}" completed in ${totalDurationMs}ms ` +
      `(${stepResults.filter((s) => s.status === 'completed').length}/${steps.length} steps executed)`,
    );

    return {
      output: currentInput as TOut,
      steps: stepResults,
      totalDurationMs,
      runId,
    };
  }
}
