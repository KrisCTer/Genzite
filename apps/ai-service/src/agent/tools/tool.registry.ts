import { Injectable, Logger, NotFoundException, Inject } from '@nestjs/common';
import type { FunctionDeclaration } from '@google/generative-ai';
import { AiTool, AI_TOOLS } from './tool.interface.js';

/**
 * Central registry for all AI-callable tools.
 * Converts registered tools to Gemini FunctionDeclarations
 * and dispatches execution by tool name.
 */
@Injectable()
export class ToolRegistry {
  private readonly logger = new Logger(ToolRegistry.name);
  private readonly tools = new Map<string, AiTool>();

  constructor(@Inject(AI_TOOLS) tools: AiTool[]) {
    for (const tool of tools) {
      this.tools.set(tool.declaration.name, tool);
    }
    this.logger.log(`Registered ${this.tools.size} tools: ${[...this.tools.keys()].join(', ')}`);
  }

  getDeclarations(): FunctionDeclaration[] {
    return [...this.tools.values()].map((t) => t.declaration);
  }

  getAll(): AiTool[] {
    return [...this.tools.values()];
  }

  registerTool(tool: AiTool): void {
    this.tools.set(tool.declaration.name, tool);
    this.logger.log(`Dynamically registered tool: ${tool.declaration.name}`);
  }

  async executeTool(name: string, params: Record<string, unknown>): Promise<unknown> {
    const tool = this.tools.get(name);
    if (!tool) {
      throw new NotFoundException(`Tool not found: ${name}`);
    }

    this.logger.log(`Executing tool: ${name}`);
    const start = Date.now();
    const result = await tool.execute(params);
    this.logger.log(`Tool ${name} completed in ${Date.now() - start}ms`);

    return result;
  }
}
