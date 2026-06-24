import { Injectable } from '@nestjs/common';
import { SchemaType, type FunctionDeclaration } from '@google/generative-ai';
import type { AiTool } from '../tool.interface.js';
import { CvAnalyzerService } from '../../../recruitment/cv-analyzer.service.js';

@Injectable()
export class AnalyzeCvTool implements AiTool {
  constructor(private readonly cvAnalyzer: CvAnalyzerService) {}

  readonly declaration: FunctionDeclaration = {
    name: 'analyze_cv',
    description:
      'Analyze a CV/resume against a job description. ' +
      'Returns ATS compatibility score, skill gap analysis, and improvement suggestions.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        resumeId: {
          type: SchemaType.STRING,
          description: 'The ID of the resume to analyze',
        },
        jobDescription: {
          type: SchemaType.STRING,
          description: 'The job description to match the resume against',
        },
      },
      required: ['resumeId', 'jobDescription'],
    },
  };

  async execute(params: Record<string, unknown>) {
    const resumeId = params.resumeId as string;
    const jobDescription = params.jobDescription as string;
    return this.cvAnalyzer.analyze(resumeId, jobDescription);
  }
}
