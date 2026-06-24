import type { FunctionDeclaration } from '@google/generative-ai';

/**
 * Contract for an AI-callable tool.
 * Each tool wraps an existing service method and exposes it
 * as a Gemini Function Calling declaration.
 */
export interface AiTool {
  readonly declaration: FunctionDeclaration;
  execute(params: Record<string, unknown>): Promise<unknown>;
}

/**
 * Injection token for providing all registered AI tools as an array.
 */
export const AI_TOOLS = Symbol('AI_TOOLS');
