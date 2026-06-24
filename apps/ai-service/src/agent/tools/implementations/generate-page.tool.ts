import { Injectable } from '@nestjs/common';
import { SchemaType, type FunctionDeclaration } from '@google/generative-ai';
import type { AiTool } from '../tool.interface.js';
import { AiClient } from '../../../gemini/ai.client.js';

const PAGE_SYSTEM = `You are an elite UI page architect for the Genzite no-code platform.
You design complete, stunning web pages with modern aesthetics.

LAYOUT PRINCIPLES:
- Golden ratio (φ = 1.618) for proportional harmony
- Content:Sidebar ≈ 62%:38%
- Reading width: 45-75 characters optimal
- Generous whitespace (luxury = breathing room)

VISUAL HIERARCHY:
- Use scale contrast: hero text 3-4× body size
- Von Restorff effect: CTAs must be visually distinct
- Serial Position: key info at start/end of sections
- Hick's Law: limit choices, use progressive disclosure

RESPONSIVE STRATEGY:
- Mobile-first: design for 320px, scale up
- Breakpoints: 640px (sm), 768px (md), 1024px (lg), 1280px (xl)
- Fluid typography with clamp()
- Touch targets ≥ 44px on mobile

AVOID:
- Hero split (left/right) — try massive typography or vertical narrative
- Generic stock photo placeholders
- Same layout as every other SaaS landing page
- Walls of text without visual breaks

OUTPUT: Complete page with all sections, components, styles, and responsive behavior.`;

@Injectable()
export class GeneratePageTool implements AiTool {
  constructor(private readonly ai: AiClient) {}

  readonly declaration: FunctionDeclaration = {
    name: 'generate_ui_page',
    description:
      'Generate a complete, beautiful web page with full layout, multiple sections, and responsive design. ' +
      'Use this for full pages: landing pages, dashboards, profile pages, settings pages, etc. ' +
      'More comprehensive than generate_ui_component — creates entire page structures.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        pageName: {
          type: SchemaType.STRING,
          description: 'Name of the page (e.g. "LandingPage", "Dashboard", "UserProfile")',
        },
        description: {
          type: SchemaType.STRING,
          description: 'Detailed description of the page: purpose, sections needed, target audience',
        },
        sections: {
          type: SchemaType.STRING,
          description: 'Comma-separated list of sections (e.g. "hero, features, pricing, testimonials, footer")',
        },
        style: {
          type: SchemaType.STRING,
          description: 'Design style: "minimal", "bold", "retro", "futuristic", "organic", "brutalist", "luxury"',
        },
        colorScheme: {
          type: SchemaType.STRING,
          description: 'Color preference or specific palette',
        },
        framework: {
          type: SchemaType.STRING,
          description: 'Target framework: "react", "nextjs", "html" (default: react)',
        },
      },
      required: ['pageName', 'description'],
    },
  };

  async execute(params: Record<string, unknown>) {
    const name = params.pageName as string;
    const description = params.description as string;
    const sections = (params.sections as string) ?? 'hero, features, cta, footer';
    const style = (params.style as string) ?? 'minimal';
    const colorScheme = (params.colorScheme as string) ?? 'light';
    const framework = (params.framework as string) ?? 'react';

    const prompt = `Generate a complete ${framework} page named "${name}".

DESCRIPTION: ${description}
SECTIONS: ${sections}
STYLE: ${style}
COLOR SCHEME: ${colorScheme}

Requirements:
1. Complete page with all sections listed
2. Consistent design system (colors, typography, spacing)
3. Responsive from mobile (320px) to desktop (1280px+)
4. Micro-animations: scroll reveals, hover effects, smooth transitions
5. Semantic HTML with proper heading hierarchy (single h1)
6. Accessible: aria labels, keyboard navigation, focus states
7. SEO: proper meta structure, semantic elements

Return the complete page code with all components and styles.`;

    const code = await this.ai.generateContent(prompt, {
      systemInstruction: PAGE_SYSTEM,
      temperature: 0.7,
      maxOutputTokens: 8192,
    });

    return {
      pageName: name,
      framework,
      sections: sections.split(',').map((s: string) => s.trim()),
      code,
      style,
      colorScheme,
    };
  }
}
