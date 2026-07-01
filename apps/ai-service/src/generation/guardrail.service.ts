import { Injectable, Logger } from '@nestjs/common';
import { AiClient } from '../gemini/ai.client.js';
import { GUARDRAIL_SYSTEM_INSTRUCTION } from '../gemini/prompts/guardrail.prompt.js';

export interface GuardrailResult {
  isSafe: boolean;
  reason?: string;
}

@Injectable()
export class GuardrailService {
  private readonly logger = new Logger(GuardrailService.name);

  constructor(private readonly ai: AiClient) {}

  /**
   * Check the user's prompt for signs of prompt injection or off-topic content.
   */
  async checkPrompt(prompt: string): Promise<GuardrailResult> {
    this.logger.log('Checking prompt against Guardrail...');
    
    try {
      const userMessage = `User Input: "${prompt}"\n\nIs this safe?`;
      
      const result = await this.ai.generateJson<GuardrailResult>(userMessage, {
        model: 'llama3-70b-8192', // Using Groq for ultra-fast processing (~0.2s)
        systemInstruction: GUARDRAIL_SYSTEM_INSTRUCTION,
        temperature: 0.1, // High precision required, no creativity needed
      });

      if (!result.isSafe) {
        this.logger.warn(`Guardrail blocked prompt: [${result.reason}]`);
      } else {
        this.logger.log('Guardrail passed.');
      }

      return result;
    } catch (error) {
      // Fail-closed: Block if the security system is unavailable
      this.logger.error(`Guardrail check failed: ${(error as Error).message}. Blocking request (Fail-Closed).`);
      return { isSafe: false, reason: 'Security system unavailable. Please try again later.' };
    }
  }
}
