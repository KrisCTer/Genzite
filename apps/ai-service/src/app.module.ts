import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { KafkaModule } from '@genzite/kafka';
import { PrismaModule } from './prisma/prisma.module.js';
import { GeminiModule } from './gemini/gemini.module.js';
import { GenerationModule } from './generation/generation.module.js';
import { RecruitmentModule } from './recruitment/recruitment.module.js';
import { AiProducer } from './events/ai.producer.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    GeminiModule,
    KafkaModule.forRoot(),
    GenerationModule,
    RecruitmentModule,
  ],
  providers: [AiProducer],
})
export class AppModule {}
