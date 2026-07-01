import { Injectable } from '@nestjs/common';
import type { PipelineStep, PipelineContext, ConditionalStep } from '../pipeline.interface.js';
import { PipelineRunner } from '../pipeline.runner.js';
import type { PipelineResult } from '../pipeline.interface.js';
import { AiClient } from '../../gemini/ai.client.js';
import type { GeneratedCms } from '../../generation/cms-generator.service.js';

export interface PipelineGeneratedSite {
  site: { name: string; subdomain: string };
  pages: Array<{
    title: string;
    slug: string;
    widgets: any[];
  }>;
}

// ── Step Input/Output Types ────────────────────────────────

interface SitePipelineInput {
  prompt: string;
  userId?: string;
  withCms?: boolean;
}

interface AnalyzedPrompt {
  prompt: string;
  userId?: string;
  withCms?: boolean;
  analysis: {
    siteType: string;
    targetAudience: string;
    suggestedPages: string[];
    suggestedFeatures: string[];
    colorScheme: string;
  };
}

interface GeneratedStructure {
  prompt: string;
  userId?: string;
  withCms?: boolean;
  analysis: AnalyzedPrompt['analysis'];
  site: PipelineGeneratedSite;
}

export interface SitePipelineResult {
  site: PipelineGeneratedSite;
  cms?: GeneratedCms;
  analysis: AnalyzedPrompt['analysis'];
  validation: {
    isValid: boolean;
    warnings: string[];
  };
}

// ── Step 1: Analyze Prompt ─────────────────────────────────

class AnalyzePromptStep implements PipelineStep<SitePipelineInput, AnalyzedPrompt> {
  readonly name = 'AnalyzePrompt';

  constructor(private readonly ai: AiClient) {}

  async execute(input: SitePipelineInput, context: PipelineContext): Promise<AnalyzedPrompt> {
    const prompt = `Analyze this website creation request and extract structured requirements.

USER REQUEST: "${input.prompt}"

Return JSON:
{
  "siteType": "portfolio|blog|ecommerce|landing|corporate|other",
  "targetAudience": "who the site is for",
  "suggestedPages": ["page1", "page2"],
  "suggestedFeatures": ["feature1", "feature2"],
  "colorScheme": "suggested color palette description"
}`;

    const analysis = await this.ai.generateJson<AnalyzedPrompt['analysis']>(prompt, {
      temperature: 0.5,
    });

    context.variables.set('siteType', analysis.siteType);
    return { ...input, analysis };
  }
}

// ── Step 2: Generate Site Structure ────────────────────────

class GenerateStructureStep implements PipelineStep<AnalyzedPrompt, GeneratedStructure> {
  readonly name = 'GenerateStructure';

  constructor(private readonly ai: AiClient) {}

  async execute(input: AnalyzedPrompt, context: PipelineContext): Promise<GeneratedStructure> {
    const enrichedPrompt = `Create a complete website structure.

ORIGINAL REQUEST: "${input.prompt}"
ANALYSIS:
- Site Type: ${input.analysis.siteType}
- Target Audience: ${input.analysis.targetAudience}
- Suggested Pages: ${input.analysis.suggestedPages.join(', ')}
- Color Scheme: ${input.analysis.colorScheme}

Return JSON matching GeneratedSite format:
{
  "site": { "name": "site name", "subdomain": "slug" },
  "pages": [
    {
      "title": "Page Title",
      "slug": "page-slug",
      "widgets": [
        { "type": "hero|text|gallery|contact|cta|features", "contentConfig": {}, "sortOrder": 0 }
      ]
    }
  ]
}`;

    const site = await this.ai.generateJson<PipelineGeneratedSite>(enrichedPrompt, {
      temperature: 0.7,
      maxOutputTokens: 4096,
    });

    context.variables.set('generatedSiteId', site.site.subdomain);
    return { ...input, site };
  }
}

// ── Step 3 (Conditional): Generate CMS ─────────────────────

class GenerateCmsStep implements ConditionalStep<GeneratedStructure, GeneratedStructure & { cms?: GeneratedCms }> {
  readonly name = 'GenerateCMS';

  constructor(private readonly ai: AiClient) {}

  shouldRun(input: GeneratedStructure): boolean {
    return input.withCms !== false;
  }

  async execute(
    input: GeneratedStructure,
    context: PipelineContext,
  ): Promise<GeneratedStructure & { cms?: GeneratedCms }> {
    const siteType = context.variables.get('siteType') as string;

    const prompt = `Generate CMS collections for a ${siteType} website.
Pages: ${input.site.pages.map((p) => p.title).join(', ')}

Return JSON:
{
  "collections": [
    {
      "name": "Collection Name",
      "slug": "collection-slug",
      "schemaDefinition": {
        "properties": {
          "fieldName": { "type": "string|number|boolean|date|richtext|image", "required": true, "description": "..." }
        }
      }
    }
  ]
}`;

    const cms = await this.ai.generateJson<GeneratedCms>(prompt, {
      temperature: 0.5,
      maxOutputTokens: 4096,
    });

    return { ...input, cms };
  }
}

// ── Step 4: Validate Output ────────────────────────────────

class ValidateOutputStep implements PipelineStep<GeneratedStructure & { cms?: GeneratedCms }, SitePipelineResult> {
  readonly name = 'ValidateOutput';

  async execute(input: GeneratedStructure & { cms?: GeneratedCms }): Promise<SitePipelineResult> {
    const warnings: string[] = [];

    if (!input.site.pages.length) {
      warnings.push('No pages were generated');
    }

    for (const page of input.site.pages) {
      if (!page.widgets?.length) {
        warnings.push(`Page "${page.title}" has no widgets`);
      }
    }

    if (input.cms && !input.cms.collections?.length) {
      warnings.push('CMS was requested but no collections were generated');
    }

    return {
      site: input.site,
      cms: input.cms,
      analysis: input.analysis,
      validation: {
        isValid: warnings.length === 0,
        warnings,
      },
    };
  }
}

// ── Pipeline Service ───────────────────────────────────────

@Injectable()
export class SiteBuilderPipeline {
  private readonly steps: PipelineStep[];

  constructor(
    private readonly runner: PipelineRunner,
    private readonly ai: AiClient,
  ) {
    this.steps = [
      new AnalyzePromptStep(ai),
      new GenerateStructureStep(ai),
      new GenerateCmsStep(ai),
      new ValidateOutputStep(),
    ];
  }

  async run(input: SitePipelineInput): Promise<PipelineResult<SitePipelineResult>> {
    return this.runner.run<SitePipelineInput, SitePipelineResult>(
      'site-builder',
      this.steps,
      input,
    );
  }
}
