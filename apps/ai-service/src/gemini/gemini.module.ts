import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GeminiClient } from './gemini.client.js';
import { DeepSeekClient } from './deepseek.client.js';
import { GroqClient } from './groq.client.js';
import { AiClient } from './ai.client.js';

@Module({
  imports: [ConfigModule],
  providers: [GeminiClient, DeepSeekClient, GroqClient, AiClient],
  exports: [GeminiClient, DeepSeekClient, GroqClient, AiClient],
})
export class GeminiModule {}
