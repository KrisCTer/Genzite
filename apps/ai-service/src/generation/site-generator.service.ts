import { Injectable, Logger } from '@nestjs/common';
import { AiClient } from '../gemini/ai.client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import {
  SITE_GENERATION_SYSTEM,
  SITE_GENERATION_PROMPT,
} from '../gemini/prompts/templates.js';

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

@Injectable()
export class SiteGeneratorService {
  private readonly logger = new Logger(SiteGeneratorService.name);

  constructor(
    private readonly ai: AiClient,
    private readonly prisma: PrismaService,
  ) {}

  async generate(prompt: string, userId?: string, model?: string): Promise<GeneratedSite> {
    const taskLog = await this.prisma.aiTaskLog.create({
      data: {
        userId: userId ?? 'anonymous',
        taskType: 'SITE_GENERATION',
        input: { prompt, model } as object,
        startedAt: new Date(),
      },
    });

    try {
      const filledPrompt = SITE_GENERATION_PROMPT.replace('{{PROMPT}}', prompt);

      const result = await this.ai.generateJson<GeneratedSite>(filledPrompt, {
        model: model as any,
        systemInstruction: SITE_GENERATION_SYSTEM,
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

      this.logger.log(`Site generated: "${result.site.name}" with ${result.pages.length} pages`);
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
