import { Injectable } from '@nestjs/common';
import { SchemaType, type FunctionDeclaration } from '@google/generative-ai';
import type { AiTool } from '../tool.interface.js';
import { AiClient } from '../../../gemini/ai.client.js';

const COMPONENT_SYSTEM = `You are an elite UI component architect for the Genzite no-code platform.

DESIGN PRINCIPLES:
- Every pixel has purpose. Restraint is luxury.
- 60-30-10 color rule: 60% base, 30% secondary, 10% accent.
- 8-point grid spacing (4, 8, 16, 24, 32, 48, 64px).
- Typography scale 1.25 for balanced hierarchy.
- Mobile-first responsive design.

AVOID CLICHÉS:
- NO default purple/violet as primary color
- NO bento grids for simple layouts
- NO mesh/aurora gradients
- NO dark + neon as default theme
- NO generic glassmorphism
- Take RISKS with unique design choices.

OUTPUT FORMAT:
- Return a complete, self-contained React/TSX component
- Include all CSS (CSS-in-JS, CSS modules, or inline styles)
- Use modern patterns: CSS custom properties, clamp(), container queries
- Include aria labels and semantic HTML
- Include hover/focus states and micro-animations`;

@Injectable()
export class GenerateComponentTool implements AiTool {
  constructor(private readonly ai: AiClient) {}

  readonly declaration: FunctionDeclaration = {
    name: 'generate_ui_component',
    description:
      'Generate a beautiful, production-ready UI component (React/TSX) with modern styling. ' +
      'Creates responsive, accessible components with micro-animations and premium aesthetics. ' +
      'Use this for individual UI elements: buttons, cards, forms, navbars, modals, etc.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        componentName: {
          type: SchemaType.STRING,
          description: 'Name of the component (e.g. "LoginForm", "PricingCard", "HeroSection")',
        },
        description: {
          type: SchemaType.STRING,
          description: 'Detailed description of the component including style, functionality, and context',
        },
        style: {
          type: SchemaType.STRING,
          description: 'Design style: "minimal", "bold", "retro", "futuristic", "organic", "brutalist", "luxury"',
        },
        colorScheme: {
          type: SchemaType.STRING,
          description: 'Color preference: "dark", "light", "vibrant", or specific colors like "emerald + gold"',
        },
        framework: {
          type: SchemaType.STRING,
          description: 'Target framework: "react", "nextjs", "html" (default: react)',
        },
      },
      required: ['componentName', 'description'],
    },
  };

  async execute(params: Record<string, unknown>) {
    const name = params.componentName as string;
    const description = params.description as string;
    const style = (params.style as string) ?? 'minimal';
    const colorScheme = (params.colorScheme as string) ?? 'light';
    const framework = (params.framework as string) ?? 'react';

    const prompt = `Generate a ${framework} component named "${name}".

DESCRIPTION: ${description}
STYLE: ${style}
COLOR SCHEME: ${colorScheme}

Requirements:
1. Production-ready code with TypeScript types
2. Fully responsive (mobile → desktop)
3. Include hover states, focus states, and smooth transitions
4. Semantic HTML with aria attributes
5. Self-contained (all styles included)
6. Include prop types/interface

Return the complete component code.`;

    const code = await this.ai.generateContent(prompt, {
      systemInstruction: COMPONENT_SYSTEM,
      temperature: 0.7,
      maxOutputTokens: 4096,
    });

    return {
      componentName: name,
      framework,
      code,
      style,
      colorScheme,
    };
  }
}
