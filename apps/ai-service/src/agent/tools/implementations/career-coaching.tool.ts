import { Injectable } from '@nestjs/common';
import { SchemaType, type FunctionDeclaration } from '@google/generative-ai';
import type { AiTool } from '../tool.interface.js';
import { CareerCoachService } from '../../../recruitment/career-coach.service.js';

@Injectable()
export class CareerCoachingTool implements AiTool {
  constructor(private readonly careerCoach: CareerCoachService) {}

  readonly declaration: FunctionDeclaration = {
    name: 'career_coaching',
    description:
      'Generate a personalized career development roadmap for a candidate. ' +
      'Analyzes skills, suggests learning paths, and recommends career transitions.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        resumeId: {
          type: SchemaType.STRING,
          description: 'The ID of the resume to generate career roadmap for',
        },
      },
      required: ['resumeId'],
    },
  };

  async execute(params: Record<string, unknown>) {
    const resumeId = params.resumeId as string;
    return this.careerCoach.generateRoadmap(resumeId);
  }
}
