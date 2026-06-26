import { Injectable } from '@nestjs/common';
import { SchemaType, type FunctionDeclaration } from '@google/generative-ai';
import type { AiTool } from '../tool.interface.js';
import { SiteGeneratorService } from '../../../generation/site-generator.service.js';

@Injectable()
export class GenerateSiteTool implements AiTool {
  constructor(private readonly siteGenerator: SiteGeneratorService) {}

  readonly declaration: FunctionDeclaration = {
    name: 'generate_site',
    description:
      'Generate a complete website structure from a natural language description. ' +
      'Creates site metadata, pages, and widget layouts.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        prompt: {
          type: SchemaType.STRING,
          description: 'Description of the website to generate (e.g. "a portfolio site for a photographer")',
        },
      },
      required: ['prompt'],
    },
  };

  async execute(params: Record<string, unknown>) {
    const prompt = params.prompt as string;
    return this.siteGenerator.generate(prompt);
  }
}
