import { Injectable, Logger, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { AiClient } from '../gemini/ai.client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import {
  SECTION_PLANNER_SYSTEM,
  SECTION_PLANNER_PROMPT,
  WIDGET_GENERATOR_SYSTEM,
  WIDGET_GENERATOR_PROMPT,
  WIDGET_EXTRACTOR_INSTRUCTION
} from '../gemini/prompts/templates.js';
import { RagService } from './rag.service.js';
import { GuardrailService } from './guardrail.service.js';
import { ConfigService } from '@nestjs/config';

export interface GeneratedWidget {
  type: string;
  contentConfig?: Record<string, unknown>;
  sortOrder: number;
}

export interface GeneratedPage {
  id?: string;
  title: string;
  slug: string;
  settings?: any;
  widgets?: GeneratedWidget[];
}

export interface GeneratedSite {
  site: {
    id?: string;
    name: string;
    subdomain: string;
    description?: string;
    settings?: any;
  };
  pages: GeneratedPage[];
  projectId?: string;
  screenId?: string;
  htmlUrl?: string;
  imageUrl?: string;
  generationMode?: 'stitch' | 'hybrid';
}

interface ReflectionResult {
  passed: boolean;
  feedback?: string;
}

const PM_SYSTEM_INSTRUCTION = `You are an elite Product Manager, UX Designer and Frontend Architect for Genzite, a world-class AI web/app builder.
Your job is to take a user's brief request and craft an ultra-detailed, production-ready design specification.

MANDATORY OUTPUT REQUIREMENTS:
1. A complete, production-ready, fully responsive HTML5 page/screen.
2. MUST include ALL relevant sections for the context (web: Header, Hero, Features, Social Proof, Pricing, CTA, Footer; app: Top/Bottom NavBar, Hero, Feed, Stats).

DESIGN QUALITY — THIS IS NON-NEGOTIABLE:
- Level: Match or exceed Google Stitch / Dribbble premium quality.
- Visual Depth: Use layered glassmorphism (backdrop-blur-xl + bg-white/5), glowing shadows (shadow-[0_0_40px_rgba(...)]), and gradient fills.
- Micro-animations: floating elements (CSS @keyframes float), pulse badges, hover:scale-105, hover:-translate-y-2, active:scale-95, transition-all duration-300.
- Typography: Strictly use Google Fonts — 'Plus Jakarta Sans' or 'Space Grotesk' for headings, 'DM Sans' or 'Hanken Grotesk' for body, 'JetBrains Mono' for code/stats. Set up a proper type scale via Tailwind config.
- Color System: Generate a COMPLETE semantic Tailwind config with ALL named tokens (primary, secondary, tertiary, surface, on-surface, on-surface-variant, surface-container, outline, outline-variant, etc. — minimum 20 semantic tokens). NEVER use raw hex colors in class names — use the token names.
- Icons: Use Material Symbols Outlined loaded via Google Fonts CDN. Never use emoji as icons.
- Images: Use ONLY verified working image URLs:
  * Google AIDA CDN: https://lh3.googleusercontent.com/aida-public/[real_id] (preferred — always works)
  * Unsplash with FULL parameters: https://images.unsplash.com/photo-[REAL_10_DIGIT_ID]?w=800&h=600&fit=crop&crop=center
  * NEVER invent Unsplash IDs or use partial URLs. If unsure, use AIDA CDN URLs only.
- Layout: CSS Grid + Flexbox only. Zero absolute-positioned elements for layout flow (only for decorative glows/blobs).
- Interactions: Add a <script> for subtle parallax on mousemove, button click glow flash, and IntersectionObserver scroll fade-in.
- Scroll Behavior: Add a <script> that changes header background on scroll (transparent → blurred glass).

MANDATORY TAILWIND CONFIG BLOCK:
Always include a full tailwind.config = { ... } block with:
- Custom color tokens (minimum 20 semantic Material Design 3 tokens): primary, on-primary, primary-container, on-primary-container, secondary, on-secondary, secondary-container, on-secondary-container, tertiary, on-tertiary, tertiary-container, on-tertiary-container, surface, on-surface, on-surface-variant, surface-container, surface-container-low, surface-container-high, outline, outline-variant
- Custom fontFamily referencing 3 Google Fonts
- Custom fontSize with lineHeight + fontWeight for: display-xl, headline-lg, headline-md, body-lg, body-md, label-caps, label-md
- Custom spacing tokens (xs: 4px, sm: 12px, md: 24px, lg: 48px, xl: 80px, margin-mobile: 20px, margin-desktop: 64px, gutter: 24px)
- Custom borderRadius tokens

STRUCTURE RULES:
- Output ONE complete HTML5 document with a single <head> and single <body>.
- NEVER output multiple <html>, <head>, or <body> tags.
- The <header> must be FIXED at top. The bottom <nav> (if any) must be FIXED at bottom. These appear EXACTLY ONCE.
- All other sections are standard document flow — NOT fixed/absolute.

Do NOT generate code yourself. Generate only the descriptive design specification prompt including the required Tailwind config block.`;

const AUDITOR_SYSTEM_INSTRUCTION = `You are a strict UX/UI QA Auditor and Security Expert. 
Your job is to review HTML/Tailwind code to ensure it meets high standards of accessibility, visual hierarchy, usability, and prevents XSS or other vulnerabilities.
Return JSON strictly in this format: { "passed": boolean, "feedback": "string explaining what needs to be fixed if passed is false" }`;

const WIDGET_EXTRACTOR_INSTRUCTION_OLD = `You are an expert Frontend Architect.
Your job is to read raw HTML generated by a design tool and convert it into a structured JSON array of widgets for the Genzite Canvas Builder.
Supported Widget Types: HEADER, HERO, TEXT, FEATURELIST, IMAGEGALLERY, TESTIMONIAL, STATS, CTA, FOOTER, PRICING, FAQ, CONTACT.
Return the result strictly as a JSON object containing a "site" and "pages" array.
CRITICAL STYLING INSTRUCTION: You MUST extract CSS styling attributes from the HTML (colors, padding, borders) and inject them into each widget's contentConfig.
- bgColor: Extract background colors (e.g., "#0f172a", "rgba(0,0,0,0.5)", or gradient).
- textColor: Extract primary text color.
- padding: Extract section padding (e.g., "80px 24px").
- borderRadius: Extract border radius (e.g., "16px").
Example Output:
{
  "site": { "name": "Generated Site", "subdomain": "site-xyz" },
  "pages": [
    {
      "title": "Home",
      "slug": "home",
      "widgets": [
        { "type": "HEADER", "contentConfig": { "title": "Logo", "items": [{ "text": "Home" }], "bgColor": "#000000", "padding": "16px 24px" } },
        { "type": "HERO", "contentConfig": { "title": "Welcome", "ctaText": "Click here", "bgColor": "linear-gradient(to right, #000, #333)", "textColor": "#ffffff", "borderRadius": "24px" } }
      ]
    }
  ]
}
Ensure all content and extracted styling from the HTML is accurately represented in the widgets' contentConfig.`;

import { ToolRegistry } from '../agent/tools/tool.registry.js';

@Injectable()
export class SiteGeneratorService {
  private readonly logger = new Logger(SiteGeneratorService.name);

  constructor(
    private readonly ai: AiClient,
    private readonly prisma: PrismaService,
    private readonly rag: RagService,
    private readonly guardrail: GuardrailService,
    private readonly config: ConfigService,
    @Inject(forwardRef(() => ToolRegistry))
    private readonly toolRegistry: ToolRegistry,
  ) { }

  private formatThemeContext(themeStr?: string): string {
    if (!themeStr || themeStr === 'undefined' || themeStr === 'null' || !themeStr.trim()) return '';
    try {
      const parsed = JSON.parse(themeStr);
      return `\nCRITICAL DESIGN.MD ENFORCEMENT (User Selected Theme & Design Overrides):\n${JSON.stringify(parsed, null, 2)}\nYou MUST strictly follow these exact color palettes, typography rules, layout styles, and aesthetic instructions. Do not use default cyan/dark theme.`;
    } catch {
      const lower = themeStr.toLowerCase();
      const presets: Record<string, string> = {
        'bauhaus': 'Bauhaus Style: Primary colors (Red #DC2626, Blue #2563EB, Yellow #EAB308, Dark #171717), geometric shapes, bold clean typography, high contrast, structured grid layout.',
        'glacier': 'Glacier Style: Soft cool tones (Sky Blue #38BDF8, Lavender #A78BFA, Pink #F472B6), glassmorphism, clean typography, airy spacing, light/clean background.',
        'carbon': 'Carbon Tech Style: Deep dark zinc (#27272A), Electric Blue (#2563EB), Emerald accent (#22C55E), monospace/tech typography, sleek engineering dashboard vibe.',
        'neon-tokyo': 'Neon Tokyo Cyberpunk: Dark background (#0B0F19), vibrant Neon Rose (#F43F5E), Amber (#FBBF24), Teal (#2DD4BF), glowing effects, futuristic typography.',
        'terra': 'Terra Organic Style: Warm earthy tones (Stone #78716C, Amber/Brown #92400E, Forest Green #166534), organic curves, warm cream background, serif or classic sans typography.',
        'obsidian': 'Obsidian Dark Luxury: Deep dark/black background (#0f172a / #3F3F46), Violet/Purple accents (#8B5CF6), Emerald (#10B981), sleek minimalist luxury aesthetic.',
        'sahara': 'Sahara Warm Classic: Sunset orange (#F97316), Deep bronze (#451A03), Amber (#B45309), warm ivory backgrounds, classic editorial layout.'
      };
      const presetDesc = presets[lower] || `Custom Theme / Design Rule: ${themeStr}`;
      return `\nCRITICAL DESIGN.MD ENFORCEMENT (User Selected Theme):\n${presetDesc}\nYou MUST strictly adhere to this exact aesthetic, color palette, and vibe in every HTML class and layout decision.`;
    }
  }

  async generate(
    prompt: string,
    userId?: string,
    model?: string,
    siteId?: string,
    theme?: string,
    onProgress?: (step: string, percent: number) => void,
    attachments?: { base64?: string; url?: string; mimeType: string }[]
  ): Promise<GeneratedSite> {
    // Resolve URLs to base64 if needed
    let resolvedAttachments = attachments;
    if (attachments && attachments.length > 0) {
      resolvedAttachments = await Promise.all(
        attachments.map(async (att) => {
          if (att.url && !att.base64) {
            try {
              const res = await fetch(att.url);
              const arrayBuffer = await res.arrayBuffer();
              const base64 = Buffer.from(arrayBuffer).toString('base64');
              return { base64: `data:${att.mimeType || 'image/jpeg'};base64,${base64}`, mimeType: att.mimeType || 'image/jpeg' };
            } catch (e) {
              this.logger.error(`Failed to fetch attachment url ${att.url}`, e);
              return { base64: '', mimeType: att.mimeType };
            }
          }
          return { base64: att.base64 as string, mimeType: att.mimeType };
        })
      );
      // filter out failed ones and cast
      resolvedAttachments = resolvedAttachments.filter(a => !!a.base64) as { base64: string, mimeType: string }[];
    }

    if (resolvedAttachments && resolvedAttachments.length > 0) {
      onProgress?.('Analyzing uploaded image (Vision Auto-Detect)...', 12);
      const visionSummary = await this.analyzeVisionInput(prompt, resolvedAttachments as { base64: string; mimeType: string }[]);
      if (visionSummary) {
        prompt = `${prompt}\n\n[VISION_ANALYSIS_AUTO_DETECT]:\n${visionSummary}`;
        this.logger.log(`Vision Auto-Detect result:\n${visionSummary}`);
      }
    }

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
      // PARSE TARGET PAGE
      let pageTitle = "Home";
      let pageSlug = "home";

      let targetPageId: string | undefined;
      const targetPageMatch = prompt.match(/\[TARGET_PAGE:([a-zA-Z0-9-]+)\]/);
      if (targetPageMatch) {
        targetPageId = targetPageMatch[1];
        prompt = prompt.replace(/\[TARGET_PAGE:[a-zA-Z0-9-]+\]\s*/, '').trim();
      }

      let platform = 'WEB';
      const platformMatch = prompt.match(/\[PLATFORM:(APP|WEB)\]/i);
      if (platformMatch) {
        platform = platformMatch[1].toUpperCase();
        prompt = prompt.replace(/\[PLATFORM:(APP|WEB)\]\s*/i, '').trim();
      }

      const slugify = (str: string) => str
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      // Check for explicit create page intent (both English and Vietnamese)
      const explicitCreateMatch = prompt.match(/(?:create|add page|add|generate|tạo|thêm|thêm trang|tạo trang|làm trang|xây dựng trang)\s+(?:a\s+|an\s+|trang\s+|page\s+)?([a-zA-Z0-9_ -À-ỹ]{1,50}?)(?:\s+page|\s+trang)?$/i)
        || prompt.match(/(?:page|trang|screen)\s+([a-zA-Z0-9_ -À-ỹ]{2,40})$/i);
      const isExplicitCreatePage = /(?:create|add|generate|make|build|tạo|thêm|xây dựng|làm|thêm mới|tạo thêm)\s+(?:a\s+|an\s+|new\s+|mới\s+)?(?:page|trang|screen)|(?:page|trang|screen)\s+(?:mới|new)/i.test(prompt);

      if (targetPageId) {
        // Explicit TARGET_PAGE selected → update that exact page
        pageSlug = `page-${Date.now()}`;
        pageTitle = "Updated Page";
      } else if (isExplicitCreatePage || (explicitCreateMatch && explicitCreateMatch[1] && explicitCreateMatch[1].trim().length > 0)) {
        // Explicit "create/tạo trang <name>" intent → new named page
        const rawTitle = explicitCreateMatch && explicitCreateMatch[1] ? explicitCreateMatch[1].trim() : "New Page";
        pageTitle = rawTitle.charAt(0).toUpperCase() + rawTitle.slice(1);
        const derivedSlug = slugify(pageTitle);
        pageSlug = (derivedSlug && derivedSlug !== 'home' && derivedSlug !== 'page') ? derivedSlug : `page-${Date.now()}`;
        targetPageId = undefined;
      } else if (siteId && !siteId.startsWith('gen-') && !siteId.startsWith('new-')) {
        // No targetPageId selected + site already exists in DB with pages
        // → create a brand-new page with a unique slug so we never overwrite "home"
        const ts = Date.now();
        pageSlug = `page-${ts}`;
        pageTitle = `New Page`;
      } else {
        // Brand-new site (temporary gen- ID without explicit create intent) → bootstrap with Home
        pageSlug = "home";
        pageTitle = "Home";
      }

      // STEP 1: Parallelize RAG - Extract Golden Template from Database
      onProgress?.('Initializing generation...', 15);
      const [goldenTemplate] = await Promise.all([
        this.rag.retrieveTemplate(prompt)
      ]);

      const genMode = this.config.get<string>('GENERATION_MODE')?.replace(/['"]/g, '') || 'stitch';
      this.logger.log(`Current GENERATION_MODE from config: ${this.config.get<string>('GENERATION_MODE')} -> Parsed: ${genMode}`);

      if (genMode === 'hybrid') {
        return await this.generateHybrid(prompt, taskLog, pageTitle, pageSlug, targetPageId, siteId, theme, platform, onProgress, resolvedAttachments as { base64: string; mimeType: string }[]);
      }

      // --- STITCH MODE (LEGACY) ---
      const themeContext = this.formatThemeContext(theme);
      const pmPrompt = `User request: "${prompt}"\n\nReference Structure:\n${goldenTemplate}\n\n${themeContext}\nPlease write a highly detailed design prompt based on this request adhering to the design rules.`;

      // STEP 2: PM (Gemini) writes refined prompt
      onProgress?.('Product Manager is drafting design spec...', 30);

      let finalPmSystem = PM_SYSTEM_INSTRUCTION + themeContext;
      if (platform === 'APP') {
        finalPmSystem += `\nCRITICAL PLATFORM ENFORCEMENT: The user has requested a Mobile App. You MUST design it for a mobile screen (e.g., Bottom Tab Bar, App Header, App layout) rather than a desktop website.`;
      }

      const refinedPrompt = await this.ai.generateContent(pmPrompt, {
        model: model as any,
        systemInstruction: finalPmSystem,
        temperature: 0.7,
        tools: this.toolRegistry.getDeclarations(), // Allow Gemini to use MCP tools if it needs to check codebase
      });

      this.logger.log(`Refined Prompt: ${refinedPrompt.substring(0, 100)}...`);

      // STEP 3: Designer (Stitch SDK) generates UI
      onProgress?.('Designer (Stitch) is drawing UI...', 50);
      const { stitch } = await import('@google/stitch-sdk');
      const apiKey = this.config.get<string>('STITCH_API_KEY') || this.config.get<string>('GEMINI_API_KEY');
      if (apiKey) {
        process.env.STITCH_API_KEY = apiKey;
      }
      const project = await stitch.createProject(`Genzite_${Date.now()}`);
      this.logger.log(`Created Stitch Project: ${project.id}`);

      let screen = await project.generate(refinedPrompt);
      this.logger.log(`Generated Screen: ${screen.id}`);

      let [htmlUrl, imageUrl] = await Promise.all([
        screen.getHtml(),
        screen.getImage()
      ]);

      let attempt = 1;
      const MAX_ATTEMPTS = 1; // Limit 1 loop to save Gemini API Quota
      let htmlContent = '';

      while (attempt <= MAX_ATTEMPTS) {
        // Fetch HTML from Stitch for QA auditing with error handling
        try {
          if (!htmlUrl) throw new Error("Stitch returned empty HTML URL");
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
          model: 'meta/llama-3.3-70b-instruct', // Force NVIDIA NIM for speed and accuracy
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

          let newUrls = await Promise.all([
            screen.getHtml(),
            screen.getImage()
          ]);
          htmlUrl = newUrls[0];
          imageUrl = newUrls[1];

          attempt++;
        }
      }

      // STEP 6: Bypass Widget Extraction for GrapesJS
      onProgress?.('Preparing visual editor...', 90);
      this.logger.log(`Skipping JSON extraction, saving raw HTML for GrapesJS...`);

      // Strip the full Stitch HTML document into (bodyHtml + css) so that
      // GrapesIframe can render it correctly without double-wrapping.
      // Stitch returns <!DOCTYPE html>...<html>...<body>...</body></html>
      // but GrapesIframe.buildGrapesDoc() already adds its own HTML wrapper.
      // Storing the raw full document causes nested documents → broken layout.
      const stripStitchHtml = (raw: string): { bodyHtml: string; css: string } => {
        try {
          // Extract all <style> tag contents
          const styleMatches = raw.match(/<style[^>]*>([\s\S]*?)<\/style>/gi) || [];
          const css = styleMatches
            .map(s => s.replace(/<style[^>]*>/i, '').replace(/<\/style>/i, ''))
            .join('\n');

          // Extract <body> inner content
          const bodyMatch = raw.match(/<body[^>]*>([\s\S]*)<\/body>/i);
          let bodyHtml = bodyMatch ? bodyMatch[1] : raw;

          // Remove any <script> that reads tailwind config (it will be rebuilt by buildGrapesDoc)
          // but KEEP user interaction scripts
          bodyHtml = bodyHtml.replace(/<script[^>]*id="tailwind-config"[^>]*>[\s\S]*?<\/script>/gi, '');

          return { bodyHtml: bodyHtml.trim(), css: css.trim() };
        } catch (e) {
          this.logger.warn('Failed to strip Stitch HTML, storing as-is: ' + e);
          return { bodyHtml: raw, css: '' };
        }
      };

      const isFullDocument = htmlContent.trimStart().toLowerCase().startsWith('<!doctype') ||
                             htmlContent.trimStart().toLowerCase().startsWith('<html');
      const { bodyHtml, css } = isFullDocument
        ? stripStitchHtml(htmlContent)
        : { bodyHtml: htmlContent, css: '' };

      const resolvedSiteName = this.deriveProjectNameFromPrompt(prompt);
      const extractionResult = {
        site: { 
          name: resolvedSiteName, 
          subdomain: siteId || `gen-${Date.now()}`,
          settings: { platform: platform.toLowerCase() }
        },
        pages: [{
          ...(targetPageId ? { id: targetPageId } : {}),
          title: pageTitle,
          slug: pageSlug,
          widgets: [{
            type: "GRAPESJS",
            contentConfig: { html: bodyHtml, css },
            sortOrder: 1
          }]
        }]
      };

      if (siteId) {
        extractionResult.site['id'] = siteId;
      }

      const result: GeneratedSite = {
        projectId: project.id,
        screenId: screen.id,
        htmlUrl,
        imageUrl,
        site: extractionResult.site,
        pages: extractionResult.pages,
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

  private async analyzeVisionInput(
    prompt: string,
    attachments: { base64: string; mimeType: string }[],
  ): Promise<string> {
    try {
      const visionPrompt = `You are an elite Vision Architectural & UI/UX Expert. Analyze the attached image(s) and user request: "${prompt}".
Identify the exact use case among:
1. DESIGN_CLONE (Screenshot of website/app to recreate exactly)
2. STYLE_REFERENCE (Color palette, typography, vibe, layout style to get inspiration from)
3. CONTENT_ASSET (Product image, logo, or banner to embed into sections)
4. WIREFRAME_TO_CODE (Sketch or wireframe skeleton to convert into polished UI)
5. UI_BUG_EDIT (Screenshot showing UI bug or requested visual fix)

Provide a concise, high-density actionable summary for the AI Frontend Architect that describes:
- Detected Use Case: [USE CASE]
- Visual Layout & DOM Structure: Breakdown of sections, columns, navigation style, and card hierarchy.
- Design Tokens: Exact color palette (Hex codes), typography style, spacing, and border radius.
- Key Elements to Recreate: Specific buttons, badges, hero structure, and micro-interactions shown in the image.`;

      const analysis = await this.ai.generateContent(visionPrompt, {
        model: 'gemini-2.5-flash',
        images: attachments,
      });
      return analysis;
    } catch (err: any) {
      this.logger.warn(`Vision auto-detect failed: ${err.message}. Proceeding with text prompt.`);
      return `Uploaded ${attachments.length} image reference(s). Please design matching the visual requirements in prompt: "${prompt}".`;
    }
  }

  private async generateHybrid(
    prompt: string,
    taskLog: any,
    pageTitle: string,
    pageSlug: string,
    targetPageId?: string,
    siteId?: string,
    theme?: string,
    platform: string = 'WEB',
    onProgress?: (step: string, percent: number) => void,
    attachments?: { base64: string; mimeType: string }[]
  ): Promise<GeneratedSite> {
    try {
      this.logger.log('Starting HYBRID parallel generation mode');
      onProgress?.('Planner is analyzing sections...', 20);

      // STEP 1: Plan Sections
      const themeContext = this.formatThemeContext(theme);
      let plannerSystem = SECTION_PLANNER_SYSTEM + themeContext;
      if (platform === 'APP') {
        plannerSystem += `\nCRITICAL PLATFORM ENFORCEMENT: The user wants a Mobile App. You MUST plan sections suitable for mobile (e.g. BOTTOM_NAV, APP_HEADER, MOBILE_HERO, FEED, SETTINGS) instead of standard desktop web sections. Do not use generic desktop HEADER.`;
      }
      const planPrompt = SECTION_PLANNER_PROMPT.replace('{{PROMPT}}', prompt);
      const planResult = await this.ai.generateJson<{ siteName?: string; sections: any[] }>(planPrompt, {
        model: 'gemini-2.0-flash',
        systemInstruction: plannerSystem,
      });

      const sections = planResult.sections || [];
      this.logger.log(`Planned ${sections.length} sections for parallel generation`);

      // STAGE 1: Execute Stitch Workers
      const runLlmWorker = async (sec: any) => {
        const isMobileApp = platform === 'APP';
        const workerPrompt = isMobileApp ? `You are an elite Mobile App UI Designer and Native Frontend Architect building a screen or component for a premium mobile app (intended for 390px mobile viewport width).

Section/Screen Type: ${sec.type}
Briefing: ${sec.briefing}
${themeContext ? `\nDESIGN SYSTEM & THEME:\n${themeContext}\n` : `
DESIGN SYSTEM (apply if no theme specified):
- Backgrounds: Deep dark (#0f131d, #171b26). Surface tokens for layering.
- Accent: Use a vivid primary (rose/teal/amber) with glow shadows.
- Typography: Space Grotesk for headings, Hanken Grotesk for body, Geist for mono.
- Use Google Fonts CDN links in the HTML head section.`}

CRITICAL MOBILE APP LAYOUT RULES:
1. Mobile-First Compact Layout: The HTML MUST be structured for a 390px-wide mobile screen. Use compact padding (e.g. py-4 px-4, p-3) instead of huge desktop padding (py-20 px-8).
2. Mobile UI Components: Use native mobile design patterns like Bottom Navigation/Tab bars, compact App Headers, rounded card stacks, scrollable chips/stories, and touch-friendly buttons (min-h-[48px]).
3. Zero Wide Multi-Column Grids: Do NOT use wide desktop grids (grid-cols-3 or grid-cols-4). Use flex-col, space-y-4, or horizontal swipeable rows (overflow-x-auto snap-x).

STRICT OUTPUT RULES:
1. Output a valid JSON object ONLY (no markdown fences).
2. The "html" field must contain a COMPLETE, STANDALONE HTML snippet optimized for mobile:
   - Include <link> tags for Google Fonts at the top if this is the first section.
   - Include <script id="tailwind-config"> block with custom color tokens and spacing.
   - Include custom CSS @keyframes for smooth mobile transitions and micro-interactions.
3. Quality Bar: Must look like an elite iOS / Android app from Dribbble or Mobbin.

Return ONLY this JSON shape:
{
  "contentConfig": {
    "html": "<complete mobile html here>",
    "title": "Main Heading",
    "subtitle": "Sub heading text",
    "sectionType": "${sec.type}"
  }
}` : `You are an elite Frontend Architect and Luxury UI Designer building a section of a premium website.

Section Type: ${sec.type}
Briefing: ${sec.briefing}
${themeContext ? `\nDESIGN SYSTEM & THEME:\n${themeContext}\n` : `
DESIGN SYSTEM (apply if no theme specified):
- Backgrounds: Deep dark (#0f131d, #171b26). Surface tokens for layering.
- Accent: Use a vivid primary (rose/teal/amber) with glow shadows.
- Typography: Plus Jakarta Sans for headings, DM Sans for body, JetBrains Mono for mono.
- Use Tailwind token class names (e.g. text-primary, bg-surface, text-on-surface-variant).`}

STRICT OUTPUT RULES:
1. Output a valid JSON object ONLY (no markdown fences).
2. The "html" field must contain a SECTION HTML snippet (no full doc wrapper):
   - If type is HEADER: output a <header> element only (can use fixed positioning).
   - If type is FOOTER or BOTTOM_NAV: output a <footer> or <nav> element only (can use fixed bottom positioning).
   - For ALL other types: output a <section> element with standard document flow (NOT fixed/absolute).
   - Use Tailwind token class names only (e.g. bg-primary, text-on-surface).
   - Include micro-interactions via hover:, active:, and group-hover: Tailwind modifiers.
   - Material Symbols Outlined for icons (referenced via class "material-symbols-outlined").
3. The "css" field must contain ONLY custom CSS that cannot be expressed in Tailwind (e.g. @keyframes, .hide-scrollbar, .glass-pane). Keep it clean — no redundant longhand values like "background-position-x:initial".
4. Images: Use ONLY verified working URLs:
   * Unsplash with REAL photo IDs and params: https://images.unsplash.com/photo-[REAL_NUMERIC_ID]?w=800&h=600&fit=crop
   * Do NOT invent Unsplash photo IDs. Only use IDs you are confident exist.
5. Quality Bar: The output MUST look like a Dribbble or Awwwards finalist — NOT a template or wireframe.

Return ONLY this JSON shape:
{
  "contentConfig": {
    "html": "<section or element html here (NO full doc wrapper)>",
    "css": "/* only custom @keyframes or special CSS */",
    "title": "Main Heading",
    "subtitle": "Sub heading text",
    "sectionType": "${sec.type}"
  }
}`;

        let modelName = 'deepseek-v4-flash';
        if (sec.assignTo === 'nvidia') modelName = 'meta/llama-3.3-70b-instruct';
        if (sec.assignTo === 'groq') modelName = 'llama-3.3-70b-versatile';
        if (sec.assignTo === 'deepseek') modelName = 'deepseek-v4-flash';
        
        try {
          const widgetResult = await this.ai.generateJson<{ contentConfig: any }>(workerPrompt, {
            model: modelName as any,
            systemInstruction: `You are an expert Frontend Architect and Luxury Web Designer. Always return valid JSON containing "contentConfig" with high-end custom "html" and editable text props.`,
            temperature: 0.7,
            images: attachments,
          });
          const contentConfig = widgetResult?.contentConfig || { title: sec.type };
          return {
            type: contentConfig.html ? "CUSTOM_HTML" : sec.type,
            sortOrder: sec.sortOrder,
            contentConfig: {
              ...contentConfig,
              sectionType: sec.type
            }
          };
        } catch (e) {
          this.logger.warn(`Worker ${modelName} failed for ${sec.type}, falling back...`);
          try {
            const fallbackResult = await this.ai.generateJson<{ contentConfig: any }>(workerPrompt, {
              model: 'meta/llama-3.3-70b-instruct',
              systemInstruction: `You are an expert Frontend Architect and Luxury Web Designer. Always return valid JSON containing "contentConfig" with high-end custom "html" and editable text props.`,
            });
            const contentConfig = fallbackResult?.contentConfig || { title: sec.type };
            return {
              type: contentConfig.html ? "CUSTOM_HTML" : sec.type,
              sortOrder: sec.sortOrder,
              contentConfig: {
                ...contentConfig,
                sectionType: sec.type
              }
            };
          } catch (fallbackErr: any) {
            this.logger.error(`All workers failed for ${sec.type}: ${fallbackErr.message}`);
            return {
              type: sec.type,
              sortOrder: sec.sortOrder,
              contentConfig: { title: sec.type, subtitle: sec.briefing }
            };
          }
        }
      };

      const widgetPromises = sections.map(async (sec) => {
        if (sec.assignTo === 'stitch' || sec.type === 'HEADER' || sec.type === 'HERO') {
          try {
            const { stitch } = await import('@google/stitch-sdk');
            const apiKey = this.config.get<string>('STITCH_API_KEY') || this.config.get<string>('GEMINI_API_KEY');
            if (apiKey) process.env.STITCH_API_KEY = apiKey;
            const project = await stitch.createProject(`Genzite_Part_${Date.now()}`);
            const screenPrompt = platform === 'APP'
              ? `Design a mobile app screen (390px viewport width) for ${sec.type} section. ${sec.briefing}. ${themeContext}`
              : `Design a ${sec.type} section. ${sec.briefing}. ${themeContext}`;
            const screen = await project.generate(screenPrompt);
            const htmlUrl = await screen.getHtml();

            if (!htmlUrl) throw new Error("Stitch returned empty HTML URL");
            const res = await fetch(htmlUrl);
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

            let rawHtml = await res.text();
            const extractionResult = await this.ai.generateJson<any>(
              `Extract text properties like title, subtitle, buttons from this HTML into a JSON object:\n${rawHtml.substring(0, 10000)}`,
              { model: 'meta/llama-3.3-70b-instruct', systemInstruction: WIDGET_EXTRACTOR_INSTRUCTION }
            );

            return {
              type: "CUSTOM_HTML",
              sortOrder: sec.sortOrder,
              contentConfig: {
                ...(extractionResult?.contentConfig || {}),
                html: rawHtml,
                sectionType: sec.type
              }
            };
          } catch (e) {
            this.logger.warn(`Failed to fetch Stitch section ${sec.type}: ${e}. Falling back to LLM generation...`);
            return await runLlmWorker(sec);
          }
        } else {
          return await runLlmWorker(sec);
        }
      });

      const generatedWidgets = await Promise.all(widgetPromises);
      generatedWidgets.sort((a, b) => a.sortOrder - b.sortOrder);

      onProgress?.('Merging and finalizing UI...', 90);

      // Build a single merged HTML document from all section fragments.
      // This prevents duplicate fixed headers/navbars, CSS conflicts,
      // and nested tailwind configs — matching Stitch's single-document output.
      const mergeHybridSections = (widgets: any[], platformMode: string): { html: string; css: string } => {
        const isMobile = platformMode === 'APP';
        const allCss: string[] = [];
        const sectionHtmlParts: string[] = [];

        // Collect CSS keyframes and custom classes from all sections
        for (const w of widgets) {
          const cc = w.contentConfig || {};
          if (cc.css && typeof cc.css === 'string' && cc.css.trim()) {
            allCss.push(cc.css.trim());
          }
          // Also strip inline <style> tags from the html if present
          if (cc.html && typeof cc.html === 'string') {
            const styleMatches = cc.html.match(/<style[^>]*>([\s\S]*?)<\/style>/gi) || [];
            styleMatches.forEach(s => {
              const inner = s.replace(/<style[^>]*>/i, '').replace(/<\/style>/i, '').trim();
              if (inner) allCss.push(inner);
            });
          }
        }

        // Deduplicate @keyframes blocks
        const seen = new Set<string>();
        const dedupedCss = allCss.filter(block => {
          const key = block.substring(0, 60);
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        }).join('\n');

        // Collect section HTML bodies (strip <html>/<head>/<body> wrappers if present)
        for (const w of widgets) {
          const cc = w.contentConfig || {};
          let html = cc.html || '';
          if (!html) continue;

          // If this is a full document, extract just the body content
          const isFullDoc = html.trimStart().toLowerCase().startsWith('<!doctype') || html.trimStart().toLowerCase().startsWith('<html');
          if (isFullDoc) {
            const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
            html = bodyMatch ? bodyMatch[1] : html;
            // Remove tailwind-config script (we'll use one central one)
            html = html.replace(/<script[^>]*id="tailwind-config"[^>]*>[\s\S]*?<\/script>/gi, '');
          }
          // Strip inline <style> tags (already extracted to CSS)
          html = html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
          sectionHtmlParts.push(html.trim());
        }

        const bodyHtml = sectionHtmlParts.join('\n\n');

        return {
          html: bodyHtml,
          css: `
/* Custom CSS - merged from all sections */
body { font-family: 'DM Sans', 'Hanken Grotesk', sans-serif; overflow-x: hidden; }
.glass-pane { backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); background: rgba(255,255,255,0.6); border: 1px solid rgba(255,255,255,0.6); }
.hide-scrollbar::-webkit-scrollbar { display: none; }
.hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
.shimmer { background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0) 100%); background-size: 200% 100%; animation: shimmer 3s infinite; }
@keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
@keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
@keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
${dedupedCss}
`
        };
      };

      const { html: mergedHtml, css: mergedCss } = mergeHybridSections(generatedWidgets, platform);

      const generatedSubdomain = siteId ? siteId : `gen-${Date.now()}`;
      const resolvedSiteName = this.deriveProjectNameFromPrompt(prompt, planResult?.siteName);
      const result: GeneratedSite = {
        projectId: `hybrid-${Date.now()}`,
        screenId: `hybrid-screen`,
        site: { 
          ...(siteId ? { id: siteId } : {}), 
          name: resolvedSiteName, 
          subdomain: generatedSubdomain,
          settings: { platform: platform.toLowerCase(), prompt, systemPrompt: prompt }
        },
        pages: [{
          ...(targetPageId ? { id: targetPageId } : {}),
          title: pageTitle,
          slug: pageSlug,
          settings: { designPrompt: prompt },
          widgets: [{
            type: 'GRAPESJS',
            sortOrder: 1,
            contentConfig: { html: mergedHtml, css: mergedCss }
          }]
        }]
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
      this.logger.log(`Hybrid generation finalized.`);
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

  private deriveProjectNameFromPrompt(prompt: string, aiName?: string): string {
    if (aiName && !['home', 'website', 'project', 'generated site', 'my genzite project', 'new page', 'new site', 'untitled'].includes(aiName.trim().toLowerCase())) {
      return aiName.trim();
    }
    // Clean and extract keywords from prompt if aiName is generic or missing
    const cleanPrompt = prompt
      .replace(/\[TARGET_PAGE:[^\]]+\]\s*/gi, '')
      .replace(/\[PLATFORM:[^\]]+\]\s*/gi, '')
      .replace(/^(?:Please create a |Please create |Create a |Design a |Build a |Make a |Generate a |Please |Create |Design |Build |Make |Generate )+/gi, '')
      .trim();

    if (cleanPrompt && cleanPrompt.length >= 3) {
      const words = cleanPrompt.split(/\s+/).slice(0, 8);
      let name = words.join(' ');
      if (name.length > 45) {
        name = name.substring(0, 45).trim() + '...';
      }
      return name.split(' ').map(w => w ? w[0].toUpperCase() + w.slice(1) : '').join(' ');
    }
    return 'My Genzite Project';
  }

  async improvePrompt(prompt: string): Promise<string> {
    const systemInstruction = `You are an expert UI/UX Prompt Engineer.
The user will provide a short, simple prompt for building a website or app.
Your job is to expand it into a highly detailed, professional prompt suitable for an AI Website Generator.
Include specific details about:
1. Overall aesthetic (colors, vibe, typography)
2. Layout structure (Header, Hero section, Features, Footer)
3. Interactive elements (hover effects, animations)
4. Target audience and tone

Output ONLY the improved prompt in English, without any conversational filler or introductory text. Do not wrap in markdown quotes if it's just plain text. Format clearly.`;

    try {
      const improved = await this.ai.generateContent(prompt, {
        model: 'deepseek-v4-flash',
        systemInstruction,
        temperature: 0.7,
        maxOutputTokens: 500,
      });
      return improved.trim();
    } catch (error) {
      this.logger.error(`Failed to improve prompt: ${error}`);
      throw error;
    }
  }
}
