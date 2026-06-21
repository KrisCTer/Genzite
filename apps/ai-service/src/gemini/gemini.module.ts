import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GeminiClient } from './gemini.client.js';
import { DeepSeekClient } from './deepseek.client.js';
import { AiClient } from './ai.client.js';

@Module({
  imports: [ConfigModule],
  providers: [GeminiClient, DeepSeekClient, AiClient],
  exports: [GeminiClient, DeepSeekClient, AiClient],
})
export class GeminiModule {}
