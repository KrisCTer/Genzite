import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  GoogleGenerativeAI,
  GenerativeModel,
  ChatSession,
  Content,
  type GenerationConfig,
  type FunctionDeclaration,
  type Tool as GeminiTool,
} from '@google/generative-ai';
import { GeminiApiException, GeminiParseException } from './gemini.exception.js';

export type GeminiModelName =
  | 'gemini-2.0-flash'
  | 'gemini-2.5-flash'
  | 'gemini-2.5-pro';

interface GenerateOptions {
  model?: GeminiModelName;
  systemInstruction?: string;
  temperature?: number;
  maxOutputTokens?: number;
}

@Injectable()
export class GeminiClient {
  private readonly logger = new Logger(GeminiClient.name);
  private readonly genAI: GoogleGenerativeAI;
  private readonly defaultModel: GeminiModelName;

  constructor(private readonly config: ConfigService) {
    const apiKey = this.config.getOrThrow<string>('GEMINI_API_KEY');
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.defaultModel = (this.config.get<string>('GEMINI_MODEL') ?? 'gemini-2.0-flash') as GeminiModelName;
    this.logger.log(`Gemini client initialized (default model: ${this.defaultModel})`);
  }

  private getModel(modelName?: GeminiModelName, systemInstruction?: string): GenerativeModel {
    const name = modelName ?? this.defaultModel;
    return this.genAI.getGenerativeModel({
      model: name,
      ...(systemInstruction ? { systemInstruction } : {}),
    });
  }

  /**
   * Generate free-form text content from a prompt.
   */
  async generateContent(prompt: string, options: GenerateOptions = {}): Promise<string> {
    const { model: modelName, systemInstruction, temperature, maxOutputTokens } = options;

    try {
      const model = this.getModel(modelName, systemInstruction);
      const generationConfig: GenerationConfig = {};
      if (temperature !== undefined) generationConfig.temperature = temperature;
      if (maxOutputTokens !== undefined) generationConfig.maxOutputTokens = maxOutputTokens;

      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig,
      });

      const text = result.response.text();
      this.logger.debug(`Generated ${text.length} chars (model: ${modelName ?? this.defaultModel})`);
      return text;
    } catch (error) {
      this.logger.error(`Gemini API call failed: ${error}`);
      throw new GeminiApiException(
        `Failed to generate content: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error,
      );
    }
  }

  /**
   * Generate content with guaranteed JSON output.
   * Uses Gemini's responseMimeType: 'application/json' for structured responses.
   */
  async generateJson<T = Record<string, unknown>>(
    prompt: string,
    options: GenerateOptions = {},
  ): Promise<T> {
    const { model: modelName, systemInstruction, temperature, maxOutputTokens } = options;

    try {
      const model = this.getModel(modelName, systemInstruction);
      const generationConfig: GenerationConfig = {
        responseMimeType: 'application/json',
      };
      if (temperature !== undefined) generationConfig.temperature = temperature;
      if (maxOutputTokens !== undefined) generationConfig.maxOutputTokens = maxOutputTokens;

      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig,
      });

      let text = result.response.text();
      this.logger.debug(`Generated JSON (${text.length} chars, model: ${modelName ?? this.defaultModel})`);

      // Robust JSON extraction
      const start = Math.min(
        text.indexOf('{') === -1 ? Infinity : text.indexOf('{'),
        text.indexOf('[') === -1 ? Infinity : text.indexOf('[')
      );
      const end = Math.max(text.lastIndexOf('}'), text.lastIndexOf(']'));
      if (start !== Infinity && end !== -1 && start <= end) {
        text = text.substring(start, end + 1);
      } else {
        // Fallback: strip markdown blocks if no brackets found (though JSON.parse will likely fail anyway)
        text = text.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '').trim();
      }

      try {
        return JSON.parse(text) as T;
      } catch {
        this.logger.error(`Parse error on text: ${text}`);
        throw new GeminiParseException('Failed to parse Gemini JSON response', text);
      }
    } catch (error) {
      if (error instanceof GeminiParseException) throw error;
      this.logger.error(`Gemini API call failed: ${error}`);
      throw new GeminiApiException(
        `Failed to generate JSON: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error,
      );
    }
  }

  /**
   * Create a multi-turn chat session for interactive conversations (e.g. Mock Interview).
   * Returns a ChatSession that maintains conversation history.
   */
  createChatSession(
    systemInstruction: string,
    history: Content[] = [],
    options: GenerateOptions = {},
  ): ChatSession {
    const { model: modelName, temperature, maxOutputTokens } = options;
    const model = this.getModel(modelName, systemInstruction);

    const generationConfig: GenerationConfig = {};
    if (temperature !== undefined) generationConfig.temperature = temperature;
    if (maxOutputTokens !== undefined) generationConfig.maxOutputTokens = maxOutputTokens;

    return model.startChat({
      history,
      generationConfig,
    });
  }

  /**
   * Send a message in an existing chat session and get a text response.
   */
  async chatMessage(session: ChatSession, message: string): Promise<string> {
    try {
      const result = await session.sendMessage(message);
      return result.response.text();
    } catch (error) {
      this.logger.error(`Gemini chat failed: ${error}`);
      throw new GeminiApiException(
        `Chat message failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error,
      );
    }
  }

  /**
   * One-shot chat: sends history + new message, returns response as parsed JSON.
   * Useful for stateless recruitment flows where history is stored in DB (JSONB).
   */
  async chatJson<T = Record<string, unknown>>(
    systemInstruction: string,
    history: Array<{ role: 'user' | 'model'; content: string }>,
    message: string,
    options: GenerateOptions = {},
  ): Promise<T> {
    const { model: modelName, temperature, maxOutputTokens } = options;

    try {
      const model = this.getModel(modelName, systemInstruction);
      const generationConfig: GenerationConfig = {
        responseMimeType: 'application/json',
      };
      if (temperature !== undefined) generationConfig.temperature = temperature;
      if (maxOutputTokens !== undefined) generationConfig.maxOutputTokens = maxOutputTokens;

      const chatHistory: Content[] = history.map((h) => ({
        role: h.role,
        parts: [{ text: h.content }],
      }));

      const chat = model.startChat({ history: chatHistory, generationConfig });
      const result = await chat.sendMessage(message);
      let text = result.response.text();

      // Robust JSON extraction
      const start = Math.min(
        text.indexOf('{') === -1 ? Infinity : text.indexOf('{'),
        text.indexOf('[') === -1 ? Infinity : text.indexOf('[')
      );
      const end = Math.max(text.lastIndexOf('}'), text.lastIndexOf(']'));
      if (start !== Infinity && end !== -1 && start <= end) {
        text = text.substring(start, end + 1);
      } else {
        text = text.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '').trim();
      }

      try {
        return JSON.parse(text) as T;
      } catch {
        this.logger.error(`Parse error on text: ${text}`);
        throw new GeminiParseException('Failed to parse chat JSON response', text);
      }
    } catch (error) {
      if (error instanceof GeminiParseException) throw error;
      this.logger.error(`Gemini chat JSON failed: ${error}`);
      throw new GeminiApiException(
        `Chat JSON failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error,
      );
    }
  }

  /**
   * Create a GenerativeModel configured with function calling tools.
   * Used by AgentService for the tool-calling agent loop.
   */
  getModelWithTools(
    tools: FunctionDeclaration[],
    systemInstruction?: string,
    modelName?: GeminiModelName,
  ): GenerativeModel {
    const name = modelName ?? this.defaultModel;
    const geminiTools: GeminiTool[] = [{ functionDeclarations: tools }];

    return this.genAI.getGenerativeModel({
      model: name,
      ...(systemInstruction ? { systemInstruction } : {}),
      tools: geminiTools,
    });
  }
}
