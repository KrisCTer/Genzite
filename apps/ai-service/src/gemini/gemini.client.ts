import { Injectable } from '@nestjs/common';

/**
 * Google Gemini API client wrapper.
 * All Gemini interactions go through this single client.
 */
@Injectable()
export class GeminiClient {
  private readonly apiKey: string;

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY ?? '';
  }

  async generateContent(prompt: string, systemInstruction?: string): Promise<string> {
    // TODO: Integrate with @google/generative-ai SDK
    // const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    // const result = await model.generateContent(prompt);
    console.log('[Gemini] Generating content for prompt:', prompt.substring(0, 50) + '...');
    return '{}';
  }

  async chat(history: Array<{ role: string; content: string }>, message: string): Promise<string> {
    // TODO: Implement multi-turn chat with Gemini
    console.log('[Gemini] Chat turn with message:', message.substring(0, 50) + '...');
    return '{}';
  }
}
