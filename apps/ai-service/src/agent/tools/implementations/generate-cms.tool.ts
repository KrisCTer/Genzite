import { Injectable } from '@nestjs/common';
import { SchemaType, type FunctionDeclaration } from '@google/generative-ai';
import type { AiTool } from '../tool.interface.js';
import { CmsGeneratorService } from '../../../generation/cms-generator.service.js';

@Injectable()
export class GenerateCmsTool implements AiTool {
  constructor(private readonly cmsGenerator: CmsGeneratorService) {}

  readonly declaration: FunctionDeclaration = {
    name: 'generate_cms',
    description:
      'Generate a CMS schema (collections and fields) for an existing site. ' +
      'Creates dynamic content structures based on a description.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        siteId: {
          type: SchemaType.STRING,
          description: 'The ID of the site to generate CMS schema for',
        },
        prompt: {
          type: SchemaType.STRING,
          description: 'Description of what CMS content is needed (e.g. "blog posts with categories and tags")',
        },
      },
      required: ['siteId', 'prompt'],
    },
  };

  async execute(params: Record<string, unknown>) {
    const siteId = params.siteId as string;
    const prompt = params.prompt as string;
    return this.cmsGenerator.generate(siteId, prompt);
  }
}
