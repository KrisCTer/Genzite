import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { GeminiApiException, GeminiParseException } from './gemini.exception.js';

const GROQ_BASE_URL = 'https://api.groq.com/openai/v1';

export type GroqModelName =
  | 'llama3-8b-8192'
  | 'llama-3.3-70b-versatile'
  | 'mixtral-8x7b-32768';

interface GenerateOptions {
  model?: GroqModelName;
  systemInstruction?: string;
  temperature?: number;
  maxOutputTokens?: number;
  tools?: any[];
}

@Injectable()
export class GroqClient {
  private readonly logger = new Logger(GroqClient.name);
  private readonly client: OpenAI;
  private readonly defaultModel: GroqModelName;

  constructor(private readonly config: ConfigService) {
    const apiKey = this.config.get<string>('GROQ_API_KEY') || 'dummy-key-to-prevent-crash';
    this.client = new OpenAI({
      baseURL: GROQ_BASE_URL,
      apiKey,
    });
    this.defaultModel = (this.config.get<string>('GROQ_MODEL') ?? 'llama-3.3-70b-versatile') as GroqModelName;
    
    if (apiKey === 'dummy-key-to-prevent-crash') {
      this.logger.warn('GROQ_API_KEY is missing. Groq provider will not be available.');
    } else {
      this.logger.log(`Groq client initialized (default model: ${this.defaultModel})`);
    }
  }

  get isConfigured(): boolean {
    return !!this.config.get<string>('GROQ_API_KEY');
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
      this.logger.error(`Groq API call failed: ${error}`);
      throw new GeminiApiException(
        `Groq failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
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
        throw new GeminiParseException('Failed to parse Groq JSON response', text);
      }
    } catch (error) {
      if (error instanceof GeminiParseException) throw error;
      this.logger.error(`Groq API call failed: ${error}`);
      throw new GeminiApiException(
        `Groq JSON failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
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
        throw new GeminiParseException('Failed to parse Groq chat JSON', text);
      }
    } catch (error) {
      if (error instanceof GeminiParseException) throw error;
      this.logger.error(`Groq chat failed: ${error}`);
      throw new GeminiApiException(
        `Groq chat failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error,
      );
    }
  }
}
