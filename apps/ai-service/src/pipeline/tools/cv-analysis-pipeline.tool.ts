import { Injectable } from '@nestjs/common';
import { SchemaType, type FunctionDeclaration } from '@google/generative-ai';
import type { AiTool } from '../../agent/tools/tool.interface.js';
import { CvAnalysisPipeline } from '../pipelines/cv-analysis.pipeline.js';

@Injectable()
export class CvAnalysisPipelineTool implements AiTool {
  constructor(private readonly pipeline: CvAnalysisPipeline) {}

  readonly declaration: FunctionDeclaration = {
    name: 'pipeline_cv_analysis',
    description:
      'Run the full CV analysis pipeline with multi-step processing: ' +
      'parse resume → extract skills → match job description → generate detailed ATS report. ' +
      'More thorough than the simple analyze_cv tool — use this for comprehensive analysis.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        resumeId: {
          type: SchemaType.STRING,
          description: 'The ID of the resume to analyze',
        },
        jobDescription: {
          type: SchemaType.STRING,
          description: 'The job description to match against',
        },
      },
      required: ['resumeId', 'jobDescription'],
    },
  };

  async execute(params: Record<string, unknown>) {
    const result = await this.pipeline.run({
      resumeId: params.resumeId as string,
      jobDescription: params.jobDescription as string,
    });
    return {
      ...result.output,
      _pipeline: {
        runId: result.runId,
        steps: result.steps,
        totalDurationMs: result.totalDurationMs,
      },
    };
  }
}
