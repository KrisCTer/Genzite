import { Injectable } from '@nestjs/common';
import { SchemaType, type FunctionDeclaration } from '@google/generative-ai';
import type { AiTool } from '../tool.interface.js';
import { MockInterviewService } from '../../../recruitment/mock-interview.service.js';

@Injectable()
export class StartInterviewTool implements AiTool {
  constructor(private readonly interviewService: MockInterviewService) {}

  readonly declaration: FunctionDeclaration = {
    name: 'start_interview',
    description:
      'Start a mock interview session for a candidate. ' +
      'Generates AI-driven interview questions based on the resume and job description.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        resumeId: {
          type: SchemaType.STRING,
          description: 'The ID of the resume to base interview questions on',
        },
        jobDescription: {
          type: SchemaType.STRING,
          description: 'The job description for the target position',
        },
        sessionType: {
          type: SchemaType.STRING,
          description: 'Interview type: "TECHNICAL", "BEHAVIORAL", or "MIXED"',
        },
      },
      required: ['resumeId', 'jobDescription'],
    },
  };

  async execute(params: Record<string, unknown>) {
    return this.interviewService.startSession({
      resumeId: params.resumeId as string,
      jobDescription: params.jobDescription as string,
      sessionType: (params.sessionType as 'TECHNICAL' | 'BEHAVIORAL' | 'MIXED') ?? 'MIXED',
    });
  }
}
