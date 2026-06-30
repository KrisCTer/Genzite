import { Injectable, Logger } from '@nestjs/common';
import { AiClient } from '../gemini/ai.client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import {
  CMS_GENERATION_SYSTEM,
  CMS_GENERATION_PROMPT,
} from '../gemini/prompts/templates.js';

export interface GeneratedCms {
  collections: Array<{
    name: string;
    slug: string;
    schemaDefinition: {
      properties: Record<string, {
        type: string;
        required?: boolean;
        description?: string;
      }>;
    };
  }>;
}

@Injectable()
export class CmsGeneratorService {
  private readonly logger = new Logger(CmsGeneratorService.name);

  constructor(
    private readonly ai: AiClient,
    private readonly prisma: PrismaService,
  ) {}

  async generate(siteId: string, prompt: string, userId?: string, model?: string): Promise<GeneratedCms> {
    const taskLog = await this.prisma.aiTaskLog.create({
      data: {
        userId: userId ?? 'anonymous',
        taskType: 'CMS_GENERATION',
        input: { siteId, prompt, model } as object,
        startedAt: new Date(),
      },
    });

    try {
      const filledPrompt = CMS_GENERATION_PROMPT.replace('{{PROMPT}}', prompt);

      const result = await this.ai.generateJson<GeneratedCms>(filledPrompt, {
        model: model as any,
        systemInstruction: CMS_GENERATION_SYSTEM,
        temperature: 0.7,
        maxOutputTokens: 8192,
      });

      await this.prisma.aiTaskLog.update({
        where: { id: taskLog.id },
        data: {
          status: 'COMPLETED',
          output: result as object,
          endedAt: new Date(),
        },
      });

      this.logger.log(`CMS generated for site ${siteId}: ${result.collections.length} collections`);
      return result;
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
