import { Injectable, Logger } from '@nestjs/common';
import { type Part } from '@google/generative-ai';
import { GeminiClient, type GeminiModelName } from '../../gemini/gemini.client.js';
import { ToolRegistry } from '../tools/tool.registry.js';

const UI_AGENT_SYSTEM = `You are the Genzite UI Design Agent — an elite frontend architect that creates stunning,
production-ready web interfaces. You combine deep UX psychology knowledge with cutting-edge design principles.

YOUR EXPERTISE:
- Modern web design: CSS Grid, Flexbox, Container Queries, clamp()
- UX Psychology: Hick's Law, Fitts' Law, Von Restorff, Serial Position
- Visual design: 60-30-10 color rule, 8pt grid, Golden Ratio
- Accessibility: WCAG 2.1 AA, semantic HTML, ARIA
- Performance: CSS containment, will-change, transform-only animations

WHEN GENERATING UI:
1. ALWAYS use generate_ui_component for individual components
2. ALWAYS use generate_ui_page for full pages
3. Use pipeline_build_site for complete website generation
4. If codebase MCP tools are available (mcp_codebase_*), use them FIRST to:
   - Scan existing project structure and design patterns
   - Find existing components to maintain consistency
   - Check color schemes and typography already in use
5. If stitch MCP tools are available (mcp_stitch_*), use them to:
   - Get design component patterns and tokens
   - Ensure design system consistency

DESIGN PHILOSOPHY:
- Every pixel has purpose. Restraint is luxury.
- Take RISKS with unique designs — avoid generic templates.
- Ask clarifying questions when style/color/audience is ambiguous.
- Mobile-first responsive approach always.

ANTI-CLICHÉ RULES:
- NO purple/violet as default primary
- NO bento grids for simple layouts
- NO mesh/aurora gradient backgrounds
- NO dark + neon as default theme
- NO hero split (left text / right image) as default
- NO generic glassmorphism
- Each design must feel UNIQUE to the project.

When the user asks for UI work, THINK about:
1. WHO is the audience? (Gen Z, B2B, luxury, etc.)
2. WHAT emotion should it evoke?
3. HOW will it be different from templates?`;

const MAX_TOOL_ITERATIONS = 8;

@Injectable()
export class UiAgentService {
  private readonly logger = new Logger(UiAgentService.name);

  constructor(
    private readonly gemini: GeminiClient,
    private readonly toolRegistry: ToolRegistry,
  ) {}

  async design(
    message: string,
    model?: string,
  ): Promise<{
    message: string;
    toolCalls: Array<{ tool: string; params: Record<string, unknown> }>;
    generatedCode: string[];
  }> {
    this.logger.log(`UI Agent request: "${message.substring(0, 100)}..."`);

    const declarations = this.toolRegistry.getDeclarations();
    const genModel = this.gemini.getModelWithTools(
      declarations,
      UI_AGENT_SYSTEM,
      (model as GeminiModelName) ?? 'gemini-2.0-flash',
    );

    const chat = genModel.startChat();
    const toolCalls: Array<{ tool: string; params: Record<string, unknown> }> = [];
    const generatedCode: string[] = [];

    let response = await chat.sendMessage(message);
    let iterations = 0;

    while (iterations++ < MAX_TOOL_ITERATIONS) {
      const functionCalls = response.response.functionCalls();
      if (!functionCalls?.length) break;

      const functionResponses: Part[] = [];
      for (const fc of functionCalls) {
        this.logger.log(`UI Agent calling tool: ${fc.name}`);
        toolCalls.push({ tool: fc.name, params: fc.args as Record<string, unknown> });

        try {
          const result = await this.toolRegistry.executeTool(
            fc.name,
            fc.args as Record<string, unknown>,
          );

          // Extract generated code from UI tools
          if (
            typeof result === 'object' &&
            result !== null &&
            'code' in result &&
            typeof (result as Record<string, unknown>).code === 'string'
          ) {
            generatedCode.push((result as Record<string, unknown>).code as string);
          }

          functionResponses.push({
            functionResponse: {
              name: fc.name,
              response: { result },
            },
          });
        } catch (error) {
          functionResponses.push({
            functionResponse: {
              name: fc.name,
              response: { error: error instanceof Error ? error.message : 'Tool execution failed' },
            },
          });
        }
      }

      response = await chat.sendMessage(functionResponses);
    }

    let finalText = '';
    try {
      finalText = response.response.text?.() ?? 'UI generation complete. Check the generated code above.';
    } catch {
      finalText = 'UI generation complete. Check the generated code above.';
    }

    return {
      message: finalText,
      toolCalls,
      generatedCode,
    };
  }
}
