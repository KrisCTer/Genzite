import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GeminiClient, type GeminiModelName } from './gemini.client.js';
import { DeepSeekClient, type DeepSeekModelName } from './deepseek.client.js';
import { GroqClient, type GroqModelName } from './groq.client.js';

/**
 * All supported model names across providers.
 * The AiClient automatically routes to the correct provider based on model prefix.
 */
export type AiModelName = GeminiModelName | DeepSeekModelName | GroqModelName;

export type AiProvider = 'gemini' | 'deepseek' | 'groq';

import { type FunctionDeclaration } from '@google/generative-ai';

interface AiGenerateOptions {
  model?: AiModelName;
  systemInstruction?: string;
  temperature?: number;
  maxOutputTokens?: number;
  tools?: FunctionDeclaration[];
}

/**
 * Unified AI client facade.
 * Routes requests to the appropriate provider (Gemini or DeepSeek) based on model name.
 *
 * Usage:
 *   // Uses default provider (GEMINI_MODEL or DEEPSEEK_MODEL from env)
 *   await aiClient.generateJson(prompt);
 *
 *   // Explicitly choose a model
 *   await aiClient.generateJson(prompt, { model: 'deepseek-chat' });
 *   await aiClient.generateJson(prompt, { model: 'gemini-2.5-flash' });
 */
@Injectable()
export class AiClient {
  private readonly logger = new Logger(AiClient.name);
  private readonly defaultProvider: AiProvider;

  constructor(
    private readonly config: ConfigService,
    private readonly gemini: GeminiClient,
    private readonly deepseek: DeepSeekClient,
    private readonly groq: GroqClient,
  ) {
    this.defaultProvider = (this.config.get<string>('AI_DEFAULT_PROVIDER') ?? 'gemini') as AiProvider;
    this.logger.log(`AI Client initialized (default provider: ${this.defaultProvider})`);
  }

  private resolveProvider(model?: AiModelName): AiProvider {
    if (!model) return this.defaultProvider;
    if (model.startsWith('deepseek')) return 'deepseek';
    if (model.startsWith('llama') || model.startsWith('mixtral')) return 'groq';
    return 'gemini';
  }

  async generateContent(prompt: string, options: AiGenerateOptions = {}): Promise<string> {
    const provider = this.resolveProvider(options.model);

    if (provider === 'deepseek') {
      return this.deepseek.generateContent(prompt, { ...options, model: options.model as DeepSeekModelName });
    }
    if (provider === 'groq') {
      return this.groq.generateContent(prompt, { ...options, model: options.model as GroqModelName });
    }

    try {
      return await this.gemini.generateContent(prompt, {
        ...options,
        model: options.model as GeminiModelName,
      });
    } catch (error) {
      this.logger.warn(`Gemini API failed, falling back to Groq... (${error})`);
      try {
        return await this.groq.generateContent(prompt, {
          ...options,
          model: 'llama-3.3-70b-versatile',
        });
      } catch (groqError) {
        this.logger.warn(`Groq API failed, falling back to DeepSeek... (${groqError})`);
        return this.deepseek.generateContent(prompt, {
          ...options,
          model: 'deepseek-chat',
        });
      }
    }
  }

  async generateJson<T = Record<string, unknown>>(
    prompt: string,
    options: AiGenerateOptions = {},
  ): Promise<T> {
    const provider = this.resolveProvider(options.model);

    if (provider === 'deepseek') {
      return this.deepseek.generateJson<T>(prompt, { ...options, model: options.model as DeepSeekModelName });
    }
    if (provider === 'groq') {
      return this.groq.generateJson<T>(prompt, { ...options, model: options.model as GroqModelName });
    }

    try {
      return await this.gemini.generateJson<T>(prompt, {
        ...options,
        model: options.model as GeminiModelName,
      });
    } catch (error) {
      this.logger.warn(`Gemini API failed, falling back to Groq... (${error})`);
      try {
        return await this.groq.generateJson<T>(prompt, {
          ...options,
          model: 'llama-3.3-70b-versatile',
        });
      } catch (groqError) {
        this.logger.warn(`Groq API failed, falling back to DeepSeek... (${groqError})`);
        return this.deepseek.generateJson<T>(prompt, {
          ...options,
          model: 'deepseek-chat',
        });
      }
    }
  }

  async chatJson<T = Record<string, unknown>>(
    systemInstruction: string,
    history: Array<{ role: 'user' | 'model'; content: string }>,
    message: string,
    options: AiGenerateOptions = {},
  ): Promise<T> {
    const provider = this.resolveProvider(options.model);

    if (provider === 'deepseek') {
      return this.deepseek.chatJson<T>(systemInstruction, history, message, { ...options, model: options.model as DeepSeekModelName });
    }
    if (provider === 'groq') {
      return this.groq.chatJson<T>(systemInstruction, history, message, { ...options, model: options.model as GroqModelName });
    }

    try {
      return await this.gemini.chatJson<T>(systemInstruction, history, message, {
        ...options,
        model: options.model as GeminiModelName,
      });
    } catch (error) {
      this.logger.warn(`Gemini API failed, falling back to Groq... (${error})`);
      try {
        return await this.groq.chatJson<T>(systemInstruction, history, message, {
          ...options,
          model: 'llama-3.3-70b-versatile',
        });
      } catch (groqError) {
        this.logger.warn(`Groq API failed, falling back to DeepSeek... (${groqError})`);
        return this.deepseek.chatJson<T>(systemInstruction, history, message, {
          ...options,
          model: 'deepseek-chat',
        });
      }
    }
  }
}
