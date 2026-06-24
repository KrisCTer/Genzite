import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { KafkaModule } from '@genzite/kafka';
import { PrismaModule } from './prisma/prisma.module.js';
import { GeminiModule } from './gemini/gemini.module.js';
import { GenerationModule } from './generation/generation.module.js';
import { RecruitmentModule } from './recruitment/recruitment.module.js';
import { WorkersModule } from './workers/workers.module.js';
import { AgentModule } from './agent/agent.module.js';
import { McpModule } from './mcp/mcp.module.js';
import { EventsModule } from './events/events.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 10,
    }]),
    PrismaModule,
    GeminiModule,
    KafkaModule.forRoot(),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          host: config.get<string>('REDIS_HOST', 'localhost'),
          port: config.get<number>('REDIS_PORT', 6379),
        },
      }),
    }),
    GenerationModule,
    RecruitmentModule,
    WorkersModule,
    AgentModule,
    McpModule,
    EventsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
