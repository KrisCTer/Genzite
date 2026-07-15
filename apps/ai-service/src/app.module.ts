import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { BullBoardModule } from '@bull-board/nestjs';
import { ExpressAdapter } from '@bull-board/express';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { KafkaModule } from '@genzite/kafka';
import { PrismaModule } from './prisma/prisma.module.js';
import { GeminiModule } from './gemini/gemini.module.js';
import { GenerationModule } from './generation/generation.module.js';
import { WorkersModule } from './workers/workers.module.js';
import { AgentModule } from './agent/agent.module.js';
import { McpModule } from './mcp/mcp.module.js';
import { EventsModule } from './events/events.module.js';
import { HealthController } from './health/health.controller.js';
import { MetricsModule } from './metrics/metrics.module.js';

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
      useFactory: (config: ConfigService) => {
        const host = config.get<string>('REDIS_HOST', '127.0.0.1');
        const port = config.get<number>('REDIS_PORT', 6379);
        console.log(`[BullMQ] Connecting to Redis at ${host}:${port}`);
        return {
          connection: {
            host,
            port,
            maxRetriesPerRequest: null,
          },
        };
      },
    }),
    BullBoardModule.forRoot({
      route: '/ai/admin/queues',
      adapter: ExpressAdapter,
    }),
    GenerationModule,
    WorkersModule,
    AgentModule,
    McpModule,
    EventsModule,
    MetricsModule,
  ],
  controllers: [HealthController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
