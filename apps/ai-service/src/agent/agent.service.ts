import { Injectable, Logger } from '@nestjs/common';
import { type Part } from '@google/generative-ai';
import { GeminiClient, type GeminiModelName } from '../gemini/gemini.client.js';
import { GeminiApiException } from '../gemini/gemini.exception.js';
import { ToolRegistry } from './tools/tool.registry.js';

const AGENT_SYSTEM_INSTRUCTION = `You are Genzite AI Assistant — an intelligent agent for the Genzite no-code platform.

You have access to tools that can:
- Generate complete websites from descriptions
- Generate CMS schemas for sites
- Analyze CVs/resumes against job descriptions
- Start mock interview sessions
- Generate career development roadmaps

RULES:
1. Use tools when the user's request matches a tool's capability.
2. If the user asks something general (greetings, questions about Genzite), respond directly without tools.
3. When using a tool, explain what you're doing before and summarize the result after.
4. If you need information the user hasn't provided (e.g. resumeId, siteId), ask for it instead of guessing.
5. Be helpful, concise, and professional.`;

const MAX_TOOL_ITERATIONS = 5;

interface AgentResponse {
  message: string;
  toolCalls: Array<{ tool: string; params: Record<string, unknown>; result: unknown }>;
}

@Injectable()
export class AgentService {
  private readonly logger = new Logger(AgentService.name);

  constructor(
    private readonly gemini: GeminiClient,
    private readonly toolRegistry: ToolRegistry,
  ) {}

  async chat(message: string, model?: string): Promise<AgentResponse> {
    const toolCalls: AgentResponse['toolCalls'] = [];

    try {
      const declarations = this.toolRegistry.getDeclarations();
      const geminiModel = this.gemini.getModelWithTools(
        declarations,
        AGENT_SYSTEM_INSTRUCTION,
        model as GeminiModelName | undefined,
      );

      const chat = geminiModel.startChat();
      let result = await chat.sendMessage(message);
      let response = result.response;

      for (let i = 0; i < MAX_TOOL_ITERATIONS; i++) {
        const functionCalls = response.functionCalls();
        if (!functionCalls?.length) break;

        const functionResponses: Part[] = [];
        for (const fc of functionCalls) {
          this.logger.log(`Agent calling tool: ${fc.name}`);

          let toolResult: unknown;
          try {
            toolResult = await this.toolRegistry.executeTool(fc.name, fc.args as Record<string, unknown>);
          } catch (error) {
            toolResult = { error: error instanceof Error ? error.message : 'Tool execution failed' };
          }

          toolCalls.push({ tool: fc.name, params: fc.args as Record<string, unknown>, result: toolResult });
          functionResponses.push({
            functionResponse: { name: fc.name, response: { result: toolResult } },
          });
        }

        result = await chat.sendMessage(functionResponses);
        response = result.response;
      }

      let responseText = '';
      try {
        responseText = response.text();
      } catch (e) {
        responseText = 'Thao tác đã được thực thi hoàn tất.';
      }

      return {
        message: responseText,
        toolCalls,
      };
    } catch (error) {
      this.logger.error(`Agent chat failed: ${error}`);
      throw new GeminiApiException(
        `Agent failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error,
      );
    }
  }
}
