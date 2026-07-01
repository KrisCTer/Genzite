import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { AiClient } from '../gemini/ai.client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import {
  SITE_GENERATION_SYSTEM,
  SITE_GENERATION_PROMPT,
} from '../gemini/prompts/templates.js';
import { RagService } from './rag.service.js';
import { GuardrailService } from './guardrail.service.js';
import { REFLECTION_SYSTEM_INSTRUCTION } from '../gemini/prompts/reflection.prompt.js';

export interface GeneratedSite {
  site: { name: string; subdomain: string };
  pages: Array<{
    title: string;
    slug: string;
    widgets: Array<{
      type: string;
      contentConfig: Record<string, unknown>;
      sortOrder: number;
    }>;
  }>;
}

interface ReflectionResult {
  passed: boolean;
  feedback?: string;
}

@Injectable()
export class SiteGeneratorService {
  private readonly logger = new Logger(SiteGeneratorService.name);

  constructor(
    private readonly ai: AiClient,
    private readonly prisma: PrismaService,
    private readonly rag: RagService,
    private readonly guardrail: GuardrailService,
  ) {}

  async generate(
    prompt: string, 
    userId?: string, 
    model?: string,
    onProgress?: (step: string, percent: number) => void
  ): Promise<GeneratedSite> {
    // STEP 0: Security Check (Guardrail)
    onProgress?.('Security check...', 10);
    const guardrailCheck = await this.guardrail.checkPrompt(prompt);
    if (!guardrailCheck.isSafe) {
      throw new BadRequestException(`Request rejected: ${guardrailCheck.reason || 'Inappropriate content.'}`);
    }

    const taskLog = await this.prisma.aiTaskLog.create({
      data: {
        userId: userId ?? 'anonymous',
        taskType: 'SITE_GENERATION',
        input: { prompt, model } as object,
        startedAt: new Date(),
      },
    });

    try {
      // STEP 1: RAG - Extract Golden Template from Database
      onProgress?.('Analyzing smart structure...', 30);
      const goldenTemplate = await this.rag.retrieveTemplate(prompt);
      let currentPrompt = SITE_GENERATION_PROMPT.replace('{{PROMPT}}', prompt);
      currentPrompt += `\n\n[RAG SYSTEM] Here is a Golden Template for inspiration. Do not copy names literally, but adapt its widget structure:\n${goldenTemplate}`;

      let result: GeneratedSite | null = null;
      let attempt = 1;
      const MAX_ATTEMPTS = 2;

      while (attempt <= MAX_ATTEMPTS) {
        this.logger.log(`[Attempt ${attempt}] Calling Coder AI...`);
        // STEP 2: Generation (Coder)
        onProgress?.(attempt === 1 ? 'AI is designing the interface...' : 'AI is revising the interface...', 50);
        result = await this.ai.generateJson<GeneratedSite>(currentPrompt, {
          model: model as any,
          systemInstruction: SITE_GENERATION_SYSTEM,
          temperature: 0.7,
          maxOutputTokens: 4096,
        });

        // STEP 3: Agentic Reflection (Auditor)
        onProgress?.('UX expert is reviewing...', 80);
        this.logger.log(`[Attempt ${attempt}] Calling Auditor AI (Groq)...`);
        const auditorPrompt = `Review this site JSON:\n${JSON.stringify(result, null, 2)}`;
        
        const reflection = await this.ai.generateJson<ReflectionResult>(auditorPrompt, {
          model: 'llama3-70b-8192', // Force Groq for speed
          systemInstruction: REFLECTION_SYSTEM_INSTRUCTION,
          temperature: 0.1, // Low temperature for objective review
        });

        if (reflection.passed) {
          this.logger.log(`[Attempt ${attempt}] Auditor passed!`);
          break;
        } else {
          this.logger.warn(`[Attempt ${attempt}] Auditor rejected: ${reflection.feedback}`);
          if (attempt === MAX_ATTEMPTS) {
            this.logger.warn(`Max attempts reached. Returning flawed result anyway.`);
            break;
          }
          // Feed the feedback back into the prompt for the next run
          currentPrompt += `\n\n[SYSTEM AUDITOR FEEDBACK] Your previous JSON failed validation: ${reflection.feedback}. Please fix these issues and regenerate the JSON perfectly.`;
          attempt++;
        }
      }

      await this.prisma.aiTaskLog.update({
        where: { id: taskLog.id },
        data: {
          status: 'COMPLETED',
          output: result as object,
          endedAt: new Date(),
        },
      });

      onProgress?.('Completed!', 100);
      this.logger.log(`Site generated: "${result!.site.name}" with ${result!.pages.length} pages`);
      return result!;
    } catch (error) {
      await this.prisma.aiTaskLog.update({
        where: { id: taskLog.id },
        data: {
          status: 'FAILED',
          error: error instanceof Error ? error.message : 'Unknown error',
          endedAt: new Date(),
        },
      });
      throw error;
    }
  }
}
