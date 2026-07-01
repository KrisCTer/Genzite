import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { GeminiApiException, GeminiParseException } from './gemini.exception.js';

const DEEPSEEK_BASE_URL = 'https://api.deepseek.com';

export type DeepSeekModelName =
  | 'deepseek-chat'
  | 'deepseek-reasoner';

interface GenerateOptions {
  model?: DeepSeekModelName;
  systemInstruction?: string;
  temperature?: number;
  maxOutputTokens?: number;
  tools?: any[];
}

@Injectable()
export class DeepSeekClient {
  private readonly logger = new Logger(DeepSeekClient.name);
  private readonly client: OpenAI;
  private readonly defaultModel: DeepSeekModelName;

  constructor(private readonly config: ConfigService) {
    const apiKey = this.config.get<string>('DEEPSEEK_API_KEY') || 'dummy-key-to-prevent-crash';
    this.client = new OpenAI({
      baseURL: DEEPSEEK_BASE_URL,
      apiKey,
    });
    this.defaultModel = (this.config.get<string>('DEEPSEEK_MODEL') ?? 'deepseek-chat') as DeepSeekModelName;
    
    if (apiKey === 'dummy-key-to-prevent-crash') {
      this.logger.warn('DEEPSEEK_API_KEY is missing. DeepSeek provider will not be available.');
    } else {
      this.logger.log(`DeepSeek client initialized (default model: ${this.defaultModel})`);
    }
  }

  get isConfigured(): boolean {
    return !!this.config.get<string>('DEEPSEEK_API_KEY');
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
      this.logger.error(`DeepSeek API call failed: ${error}`);
      throw new GeminiApiException(
        `DeepSeek failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
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
        throw new GeminiParseException('Failed to parse DeepSeek JSON response', text);
      }
    } catch (error) {
      if (error instanceof GeminiParseException) throw error;
      this.logger.error(`DeepSeek API call failed: ${error}`);
      throw new GeminiApiException(
        `DeepSeek JSON failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
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
        throw new GeminiParseException('Failed to parse DeepSeek chat JSON', text);
      }
    } catch (error) {
      if (error instanceof GeminiParseException) throw error;
      this.logger.error(`DeepSeek chat failed: ${error}`);
      throw new GeminiApiException(
        `DeepSeek chat failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error,
      );
    }
  }
}
