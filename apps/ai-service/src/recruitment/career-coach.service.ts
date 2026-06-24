import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { AiClient } from '../gemini/ai.client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import {
  CAREER_COACHING_SYSTEM,
  CAREER_COACHING_PROMPT,
} from '../gemini/prompts/templates.js';

export interface CareerRoadmap {
  currentLevel: string;
  targetRole: string;
  roadmap: Array<{
    phase: string;
    topic: string;
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    actions: string[];
    resources: string[];
    milestone: string;
  }>;
  summary: string;
}

@Injectable()
export class CareerCoachService {
  private readonly logger = new Logger(CareerCoachService.name);

  constructor(
    private readonly ai: AiClient,
    private readonly prisma: PrismaService,
  ) {}

  async generateRoadmap(resumeId: string, userId?: string): Promise<CareerRoadmap> {
    const resume = await this.prisma.resume.findUnique({ where: { id: resumeId } });
    if (!resume) {
      throw new NotFoundException(`Resume not found: ${resumeId}`);
    }

    const resumeText = resume.rawText ?? JSON.stringify(resume.parsedProfile ?? {});

    const taskLog = await this.prisma.aiTaskLog.create({
      data: {
        userId: userId ?? resume.ownerId,
        taskType: 'CAREER_COACHING',
        input: { resumeId, action: 'career-coaching' } as object,
        startedAt: new Date(),
      },
    });

    try {
      const filledPrompt = CAREER_COACHING_PROMPT.replace('{{RESUME}}', resumeText);

      const result = await this.ai.generateJson<CareerRoadmap>(filledPrompt, {
        systemInstruction: CAREER_COACHING_SYSTEM,
        temperature: 0.5,
        maxOutputTokens: 2048,
      });

      await this.prisma.aiTaskLog.update({
        where: { id: taskLog.id },
        data: {
          status: 'COMPLETED',
          output: result as object,
          endedAt: new Date(),
        },
      });

      this.logger.log(`Career roadmap generated: resume=${resumeId}, level=${result.currentLevel}`);
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
