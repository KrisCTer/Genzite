import { Injectable, NotFoundException } from '@nestjs/common';
import type { PipelineStep, PipelineContext, ConditionalStep } from '../pipeline.interface.js';
import { PipelineRunner } from '../pipeline.runner.js';
import type { PipelineResult } from '../pipeline.interface.js';
import { AiClient } from '../../gemini/ai.client.js';
import { PrismaService } from '../../prisma/prisma.service.js';

// ── Step Input/Output Types ────────────────────────────────

interface CvPipelineInput {
  resumeId: string;
  jobDescription: string;
  userId?: string;
}

interface ParsedResume {
  resumeId: string;
  rawText: string;
  jobDescription: string;
  userId?: string;
}

interface ExtractedSkills {
  resumeId: string;
  rawText: string;
  jobDescription: string;
  userId?: string;
  skills: string[];
  experience: string[];
  education: string[];
}

interface SkillMatch {
  resumeId: string;
  jobDescription: string;
  userId?: string;
  skills: string[];
  matchedSkills: string[];
  missingSkills: string[];
  matchPercentage: number;
}

export interface CvPipelineReport {
  resumeId: string;
  atsScore: number;
  breakdown: {
    keywordMatch: number;
    skillsMatch: number;
    experienceRelevance: number;
    formattingQuality: number;
  };
  matchedSkills: string[];
  missingSkills: string[];
  strengths: string[];
  improvements: string[];
  compatibilityReport: string;
}

// ── Step 1: Parse Resume Text ──────────────────────────────

class ParseResumeStep implements PipelineStep<CvPipelineInput, ParsedResume> {
  readonly name = 'ParseResumeText';

  constructor(private readonly prisma: PrismaService) {}

  async execute(input: CvPipelineInput): Promise<ParsedResume> {
    const resume = await this.prisma.resume.findUnique({ where: { id: input.resumeId } });
    if (!resume) throw new NotFoundException(`Resume not found: ${input.resumeId}`);

    const rawText = resume.rawText ?? JSON.stringify(resume.parsedProfile ?? {});
    return { ...input, rawText };
  }
}

// ── Step 2: Extract Skills ─────────────────────────────────

class ExtractSkillsStep implements PipelineStep<ParsedResume, ExtractedSkills> {
  readonly name = 'ExtractSkills';

  constructor(private readonly ai: AiClient) {}

  async execute(input: ParsedResume, context: PipelineContext): Promise<ExtractedSkills> {
    const prompt = `Analyze this resume and extract structured information.

RESUME:
${input.rawText}

Return JSON:
{
  "skills": ["skill1", "skill2"],
  "experience": ["role @ company - duration"],
  "education": ["degree @ university"]
}`;

    const result = await this.ai.generateJson<{
      skills: string[];
      experience: string[];
      education: string[];
    }>(prompt, { temperature: 0.2 });

    context.variables.set('extractedSkills', result.skills);
    return { ...input, ...result };
  }
}

// ── Step 3: Match JD ───────────────────────────────────────

class MatchJobDescriptionStep implements PipelineStep<ExtractedSkills, SkillMatch> {
  readonly name = 'MatchJobDescription';

  constructor(private readonly ai: AiClient) {}

  async execute(input: ExtractedSkills, context: PipelineContext): Promise<SkillMatch> {
    const prompt = `Compare candidate skills against job description.

CANDIDATE SKILLS: ${JSON.stringify(input.skills)}
JOB DESCRIPTION: ${input.jobDescription}

Return JSON:
{
  "matchedSkills": ["skills that match JD"],
  "missingSkills": ["skills candidate lacks"],
  "matchPercentage": 75
}`;

    const result = await this.ai.generateJson<{
      matchedSkills: string[];
      missingSkills: string[];
      matchPercentage: number;
    }>(prompt, { temperature: 0.2 });

    context.variables.set('matchPercentage', result.matchPercentage);

    return {
      resumeId: input.resumeId,
      jobDescription: input.jobDescription,
      userId: input.userId,
      skills: input.skills,
      ...result,
    };
  }
}

// ── Step 4: Generate Full Report ───────────────────────────

class GenerateReportStep implements PipelineStep<SkillMatch, CvPipelineReport> {
  readonly name = 'GenerateReport';

  constructor(private readonly ai: AiClient) {}

  async execute(input: SkillMatch): Promise<CvPipelineReport> {
    const prompt = `Generate a comprehensive ATS compatibility report.

MATCHED SKILLS: ${JSON.stringify(input.matchedSkills)}
MISSING SKILLS: ${JSON.stringify(input.missingSkills)}
MATCH PERCENTAGE: ${input.matchPercentage}%
JOB DESCRIPTION: ${input.jobDescription}

Return JSON:
{
  "atsScore": 0-100,
  "breakdown": {
    "keywordMatch": 0-100,
    "skillsMatch": 0-100,
    "experienceRelevance": 0-100,
    "formattingQuality": 0-100
  },
  "strengths": ["strength1"],
  "improvements": ["improvement1"],
  "compatibilityReport": "detailed narrative report"
}`;

    const result = await this.ai.generateJson<Omit<CvPipelineReport, 'resumeId' | 'matchedSkills' | 'missingSkills'>>(prompt, {
      temperature: 0.4,
      maxOutputTokens: 2048,
    });

    return {
      resumeId: input.resumeId,
      matchedSkills: input.matchedSkills,
      missingSkills: input.missingSkills,
      ...result,
    };
  }
}

// ── Step 5 (Conditional): Save to DB ───────────────────────

class SaveResultStep implements ConditionalStep<CvPipelineReport, CvPipelineReport> {
  readonly name = 'SaveToDatabase';

  constructor(private readonly prisma: PrismaService) {}

  shouldRun(_input: CvPipelineReport, context: PipelineContext): boolean {
    return !context.variables.get('skipPersistence');
  }

  async execute(input: CvPipelineReport): Promise<CvPipelineReport> {
    await this.prisma.resume.update({
      where: { id: input.resumeId },
      data: { atsScores: input as object },
    });
    return input;
  }
}

// ── Pipeline Service ───────────────────────────────────────

@Injectable()
export class CvAnalysisPipeline {
  private readonly steps: PipelineStep[];

  constructor(
    private readonly runner: PipelineRunner,
    private readonly ai: AiClient,
    private readonly prisma: PrismaService,
  ) {
    this.steps = [
      new ParseResumeStep(prisma),
      new ExtractSkillsStep(ai),
      new MatchJobDescriptionStep(ai),
      new GenerateReportStep(ai),
      new SaveResultStep(prisma),
    ];
  }

  async run(input: CvPipelineInput): Promise<PipelineResult<CvPipelineReport>> {
    return this.runner.run<CvPipelineInput, CvPipelineReport>(
      'cv-analysis',
      this.steps,
      input,
    );
  }
}
