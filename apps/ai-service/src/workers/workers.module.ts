import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { GenerationModule } from '../generation/generation.module.js';
import { AgentModule } from '../agent/agent.module.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { AgentWorker } from './agent.worker.js';
import { SiteGenerationWorker, CmsGenerationWorker } from './generation.worker.js';
import { AI_QUEUES } from './queue.constants.js';

@Module({
  imports: [
    BullModule.registerQueue(
      {
        name: AI_QUEUES.SITE_GENERATION,
        defaultJobOptions: { attempts: 5, backoff: { type: 'exponential', delay: 5000 } },
      },
      {
        name: AI_QUEUES.CMS_GENERATION,
        defaultJobOptions: { attempts: 5, backoff: { type: 'exponential', delay: 5000 } },
      },
      {
        name: AI_QUEUES.AGENT_TASKS,
        defaultJobOptions: { attempts: 5, backoff: { type: 'exponential', delay: 5000 } },
      },
    ),
    BullBoardModule.forFeature(
      { name: AI_QUEUES.SITE_GENERATION, adapter: BullMQAdapter },
      { name: AI_QUEUES.CMS_GENERATION, adapter: BullMQAdapter },
      { name: AI_QUEUES.AGENT_TASKS, adapter: BullMQAdapter },
    ),
    GenerationModule,
    AgentModule,
    PrismaModule,
  ],
  providers: [
    SiteGenerationWorker,
    CmsGenerationWorker,
    AgentWorker,
  ],
  exports: [BullModule],
})
export class WorkersModule {}
