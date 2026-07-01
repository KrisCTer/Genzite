import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { AiClient } from '../gemini/ai.client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { RagService } from './rag.service.js';
import { GuardrailService } from './guardrail.service.js';
import { stitch } from '@google/stitch-sdk';


export interface GeneratedSite {
  projectId: string;
  screenId: string;
  htmlUrl: string;
  imageUrl: string;
}

interface ReflectionResult {
  passed: boolean;
  feedback?: string;
}

const PM_SYSTEM_INSTRUCTION = `You are an expert Product Manager and UX Designer for Genzite. 
Your job is to take a user's brief request and expand it into a highly detailed, professional UI design prompt.

CRITICAL REQUIREMENT - You MUST append this EXACT Design System block to the very bottom of your output prompt:
**DESIGN SYSTEM (REQUIRED):**
- **Frameworks:** React (Function Components), Tailwind CSS v4, Lucide React (icons), Framer Motion (animations).
- **Theme:** Dark mode by default (Backgrounds: #09090b, #0f172a, #111827).
- **Typography:** 'Inter' font for everything. Use semantic sizes (text-sm, text-base, text-2xl, etc.).
- **Colors:** Use Slate/Zinc for neutrals. Primary accent should be Cyan/Emerald gradient or #06B6D4. No Purple/Violet.
- **Components:** Use shadcn-like clean components with rounded corners (rounded-xl, rounded-2xl).
- **Interactive:** Add hover effects (hover:scale-105, hover:bg-white/10), smooth transitions (transition-all duration-300).
- **Output:** MUST use semantic HTML5 elements. MUST NOT use generic HTML tables for layouts.

Do NOT generate code yourself. Only generate the descriptive prompt including the required Design System block.`;

const AUDITOR_SYSTEM_INSTRUCTION = `You are a strict UX/UI QA Auditor. 
Your job is to review HTML/Tailwind code to ensure it meets high standards of accessibility, visual hierarchy, and usability.
Return JSON strictly in this format: { "passed": boolean, "feedback": "string explaining what needs to be fixed if passed is false" }`;

import { ToolRegistry } from '../agent/tools/tool.registry.js';

@Injectable()
export class SiteGeneratorService {
  private readonly logger = new Logger(SiteGeneratorService.name);

  constructor(
    private readonly ai: AiClient,
    private readonly prisma: PrismaService,
    private readonly rag: RagService,
    private readonly guardrail: GuardrailService,
    private readonly toolRegistry: ToolRegistry,
  ) { }

  async generate(
    prompt: string,
    userId?: string,
    model?: string,
    onProgress?: (step: string, percent: number) => void
  ): Promise<GeneratedSite> {
    // STEP 0: Security Check (Guardrail)
    onProgress?.('Security check...', 10);
    const guardrailCheck = await this.guardrail.checkPrompt(prompt);
    if (!guardrailCheck.isSafe) {
      throw new BadRequestException(`Request rejected: ${guardrailCheck.reason || 'Inappropriate content.'}`);
    }

    const taskLog = await this.prisma.aiTaskLog.create({
      data: {
        userId: userId ?? 'anonymous',
        taskType: 'SITE_GENERATION',
        input: { prompt, model } as object,
        startedAt: new Date(),
      },
    });

    try {
      // STEP 1: RAG - Extract Golden Template from Database
      onProgress?.('Analyzing smart structure...', 20);
      const goldenTemplate = await this.rag.retrieveTemplate(prompt);

      const pmPrompt = `User request: "${prompt}"\n\nReference Structure:\n${goldenTemplate}\n\nPlease write a highly detailed design prompt based on this request.`;

      // STEP 2: PM (Gemini) writes refined prompt
      onProgress?.('Product Manager is drafting design spec...', 30);
      
      const refinedPrompt = await this.ai.generateContent(pmPrompt, {
        model: model as any,
        systemInstruction: PM_SYSTEM_INSTRUCTION,
        temperature: 0.7,
        tools: this.toolRegistry.getDeclarations(), // Allow Gemini to use MCP tools if it needs to check codebase
      });

      this.logger.log(`Refined Prompt: ${refinedPrompt.substring(0, 100)}...`);

      // STEP 3: Designer (Stitch SDK) generates UI
      onProgress?.('Designer (Stitch) is drawing UI...', 50);
      const project = await stitch.createProject(`Genzite_${Date.now()}`);
      this.logger.log(`Created Stitch Project: ${project.id}`);

      let screen = await project.generate(refinedPrompt);
      this.logger.log(`Generated Screen: ${screen.id}`);

      let htmlUrl = await screen.getHtml();
      let imageUrl = await screen.getImage();

      let attempt = 1;
      const MAX_ATTEMPTS = 2; // Limit to 2 attempts to avoid long waits

      while (attempt <= MAX_ATTEMPTS) {
        // Fetch HTML from Stitch for QA auditing with error handling
        let htmlContent = '';
        try {
          const res = await fetch(htmlUrl);
          if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
          htmlContent = await res.text();
        } catch (err) {
          this.logger.warn(`[Attempt ${attempt}] Failed to fetch HTML from ${htmlUrl}: ${err}`);
          htmlContent = '<!-- Failed to load HTML -->';
        }

        // STEP 4: QA (Groq Llama 3) reviews HTML
        onProgress?.(attempt === 1 ? 'QA Expert is reviewing code...' : 'QA Expert is re-reviewing code...', 70 + attempt * 10);
        this.logger.log(`[Attempt ${attempt}] Calling QA (Groq)...`);

        const auditorPrompt = `Review this generated HTML/Tailwind for UX/UI issues:\n\n\`\`\`html\n${htmlContent.substring(0, 3000)}...\n\`\`\``;

        const reflection = await this.ai.generateJson<ReflectionResult>(auditorPrompt, {
          model: 'llama-3.3-70b-versatile', // Force Groq for speed
          systemInstruction: AUDITOR_SYSTEM_INSTRUCTION,
          temperature: 0.1,
        });

        if (reflection.passed) {
          this.logger.log(`[Attempt ${attempt}] QA passed!`);
          break;
        } else {
          this.logger.warn(`[Attempt ${attempt}] QA rejected: ${reflection.feedback}`);
          if (attempt === MAX_ATTEMPTS) {
            this.logger.warn(`Max attempts reached. Accepting current design.`);
            break;
          }

          // STEP 5: Correction loop (Edit)
          onProgress?.('Designer (Stitch) is fixing issues...', 85);
          this.logger.log(`Sending feedback to Stitch for edit...`);

          const editPrompt = `${refinedPrompt}\n\nIMPORTANT FEEDBACK TO FIX: ${reflection.feedback}`;
          screen = await project.generate(editPrompt);

          htmlUrl = await screen.getHtml();
          imageUrl = await screen.getImage();

          attempt++;
        }
      }

      const result: GeneratedSite = {
        projectId: project.id,
        screenId: screen.id,
        htmlUrl,
        imageUrl,
      };

      await this.prisma.aiTaskLog.update({
        where: { id: taskLog.id },
        data: {
          status: 'COMPLETED',
          output: result as unknown as object,
          endedAt: new Date(),
        },
      });

      onProgress?.('Completed!', 100);
      this.logger.log(`Site generation finalized.`);
      return result;
    } catch (error) {
      await this.prisma.aiTaskLog.update({
        where: { id: taskLog.id },
        data: {
          status: 'FAILED',
          error: error instanceof Error ? error.message : 'Unknown error',
          endedAt: new Date(),
        },
      });
      throw error;
    }
  }
}
