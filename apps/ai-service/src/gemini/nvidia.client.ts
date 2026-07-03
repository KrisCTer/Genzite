import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { GeminiApiException, GeminiParseException } from './gemini.exception.js';
import { type FunctionDeclaration } from '@google/generative-ai';

const NVIDIA_NIM_BASE_URL = 'https://integrate.api.nvidia.com/v1';

export type NvidiaModelName =
  | 'deepseek-ai/deepseek-v4-flash'
  | 'meta/llama-3.3-70b-instruct'
  | 'nvidia/nv-embedcode-7b-v1'
  | 'stabilityai/stable-diffusion-xl';

interface GenerateOptions {
  model?: NvidiaModelName;
  systemInstruction?: string;
  temperature?: number;
  maxOutputTokens?: number;
  tools?: FunctionDeclaration[];
}

@Injectable()
export class NvidiaClient {
  private readonly logger = new Logger(NvidiaClient.name);
  private readonly client: OpenAI;
  private readonly defaultModel: NvidiaModelName;

  constructor(private readonly config: ConfigService) {
    const apiKey = this.config.get<string>('NVIDIA_NIM_API_KEY') || 'dummy-key-to-prevent-crash';
    this.client = new OpenAI({
      baseURL: NVIDIA_NIM_BASE_URL,
      apiKey,
    });
    this.defaultModel = (this.config.get<string>('NVIDIA_NIM_MODEL') ?? 'deepseek-ai/deepseek-v4-flash') as NvidiaModelName;
    
    if (apiKey === 'dummy-key-to-prevent-crash') {
      this.logger.warn('NVIDIA_NIM_API_KEY is missing. NVIDIA NIM provider will not be available.');
    } else {
      this.logger.log(`NVIDIA client initialized (default model: ${this.defaultModel})`);
    }
  }

  get isConfigured(): boolean {
    return !!this.config.get<string>('NVIDIA_NIM_API_KEY');
  }

  async generateContent(prompt: string, options: GenerateOptions = {}): Promise<string> {
    const { model, systemInstruction, temperature, maxOutputTokens } = options;
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];

    if (systemInstruction) {
      messages.push({ role: 'system', content: systemInstruction });
    }
    messages.push({ role: 'user', content: prompt });

    try {
      const completion = await this.client.chat.completions.create({
        model: model ?? this.defaultModel,
        messages,
        ...(temperature !== undefined ? { temperature } : {}),
        ...(maxOutputTokens !== undefined ? { max_tokens: maxOutputTokens } : {}),
      });

      const text = completion.choices[0]?.message?.content ?? '';
      this.logger.debug(`Generated ${text.length} chars (model: ${model ?? this.defaultModel})`);
      return text;
    } catch (error) {
      this.logger.error(`NVIDIA API call failed: ${error}`);
      throw new GeminiApiException(
        `NVIDIA failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error,
      );
    }
  }

  async generateJson<T = Record<string, unknown>>(
    prompt: string,
    options: GenerateOptions = {},
  ): Promise<T> {
    const { model, systemInstruction, temperature, maxOutputTokens } = options;
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];

    if (systemInstruction) {
      messages.push({ role: 'system', content: systemInstruction });
    }
    messages.push({ role: 'user', content: prompt });

    try {
      const completion = await this.client.chat.completions.create({
        model: model ?? this.defaultModel,
        messages,
        response_format: { type: 'json_object' },
        ...(temperature !== undefined ? { temperature } : {}),
        ...(maxOutputTokens !== undefined ? { max_tokens: maxOutputTokens } : {}),
      });

      let text = completion.choices[0]?.message?.content ?? '{}';
      
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
        throw new GeminiParseException('Failed to parse NVIDIA JSON response', text);
      }
    } catch (error) {
      if (error instanceof GeminiParseException) throw error;
      this.logger.error(`NVIDIA API call failed: ${error}`);
      throw new GeminiApiException(
        `NVIDIA JSON failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error,
      );
    }
  }

  async chatJson<T = Record<string, unknown>>(
    systemInstruction: string,
    history: Array<{ role: 'user' | 'model'; content: string }>,
    message: string,
    options: GenerateOptions = {},
  ): Promise<T> {
    const { model, temperature, maxOutputTokens } = options;
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemInstruction },
    ];

    for (const h of history) {
      messages.push({
        role: h.role === 'model' ? 'assistant' : 'user',
        content: h.content,
      });
    }
    messages.push({ role: 'user', content: message });

    try {
      const completion = await this.client.chat.completions.create({
        model: model ?? this.defaultModel,
        messages,
        response_format: { type: 'json_object' },
        ...(temperature !== undefined ? { temperature } : {}),
        ...(maxOutputTokens !== undefined ? { max_tokens: maxOutputTokens } : {}),
      });

      let text = completion.choices[0]?.message?.content ?? '{}';
      
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
        throw new GeminiParseException('Failed to parse NVIDIA chat JSON', text);
      }
    } catch (error) {
      if (error instanceof GeminiParseException) throw error;
      this.logger.error(`NVIDIA chat failed: ${error}`);
      throw new GeminiApiException(
        `NVIDIA chat failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error,
      );
    }
  }
}
