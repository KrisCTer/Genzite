import { Injectable } from '@nestjs/common';
import { SchemaType, type FunctionDeclaration } from '@google/generative-ai';
import type { AiTool } from '../../agent/tools/tool.interface.js';
import { SiteBuilderPipeline } from '../pipelines/site-builder.pipeline.js';

@Injectable()
export class SiteBuilderPipelineTool implements AiTool {
  constructor(private readonly pipeline: SiteBuilderPipeline) {}

  readonly declaration: FunctionDeclaration = {
    name: 'pipeline_build_site',
    description:
      'Run the intelligent site builder pipeline: ' +
      'analyze prompt → generate site structure → generate CMS schema → validate. ' +
      'More intelligent than generate_site — it first understands the request before generating.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        prompt: {
          type: SchemaType.STRING,
          description: 'Description of the website to build',
        },
        withCms: {
          type: SchemaType.BOOLEAN,
          description: 'Whether to also generate CMS collections (default: true)',
        },
      },
      required: ['prompt'],
    },
  };

  async execute(params: Record<string, unknown>) {
    const result = await this.pipeline.run({
      prompt: params.prompt as string,
      withCms: params.withCms as boolean | undefined,
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
