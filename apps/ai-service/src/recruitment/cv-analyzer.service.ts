import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { AiClient } from '../gemini/ai.client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import {
  CV_ANALYSIS_SYSTEM,
  CV_ANALYSIS_PROMPT,
} from '../gemini/prompts/templates.js';

export interface CvAnalysisResult {
  atsScore: number;
  breakdown: {
    keywordMatch: number;
    skillsMatch: number;
    experienceRelevance: number;
    formattingQuality: number;
  };
  missingSkills: string[];
  keywordOptimization: string[];
  strengths: string[];
  compatibilityReport: string;
}

@Injectable()
export class CvAnalyzerService {
  private readonly logger = new Logger(CvAnalyzerService.name);

  constructor(
    private readonly ai: AiClient,
    private readonly prisma: PrismaService,
  ) {}

  async analyze(resumeId: string, jobDescription: string, userId?: string, model?: string): Promise<CvAnalysisResult> {
    const resume = await this.prisma.resume.findUnique({ where: { id: resumeId } });
    if (!resume) {
      throw new NotFoundException(`Resume not found: ${resumeId}`);
    }

    const resumeText = resume.rawText ?? JSON.stringify(resume.parsedProfile ?? {});

    const taskLog = await this.prisma.aiTaskLog.create({
      data: {
        userId: userId ?? resume.ownerId,
        taskType: 'CV_ANALYSIS',
        input: { resumeId, jobDescription: jobDescription.substring(0, 200), model } as object,
        startedAt: new Date(),
      },
    });

    try {
      const filledPrompt = CV_ANALYSIS_PROMPT
        .replace('{{RESUME}}', resumeText)
        .replace('{{JD}}', jobDescription);

      const result = await this.ai.generateJson<CvAnalysisResult>(filledPrompt, {
        model: model as any,
        systemInstruction: CV_ANALYSIS_SYSTEM,
        temperature: 0.3,
        maxOutputTokens: 2048,
      });

      await this.prisma.resume.update({
        where: { id: resumeId },
        data: { atsScores: result as object },
      });

      await this.prisma.aiTaskLog.update({
        where: { id: taskLog.id },
        data: {
          status: 'COMPLETED',
          output: result as object,
          endedAt: new Date(),
        },
      });

      this.logger.log(`CV analyzed: resume=${resumeId}, ATS score=${result.atsScore}`);
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
