import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { GenerationModule } from '../generation/generation.module.js';
import { RecruitmentModule } from '../recruitment/recruitment.module.js';
import { AgentModule } from '../agent/agent.module.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { AnalysisWorker } from './analysis.worker.js';
import { AgentWorker } from './agent.worker.js';
import { CareerCoachingWorker, MockInterviewWorker } from './recruitment.worker.js';
import { SiteGenerationWorker, CmsGenerationWorker } from './generation.worker.js';
import { AI_QUEUES } from './queue.constants.js';

@Module({
  imports: [
    BullModule.registerQueue(
      {
        name: AI_QUEUES.CV_ANALYSIS,
        defaultJobOptions: { attempts: 3, backoff: { type: 'exponential', delay: 2000 } },
      },
      {
        name: AI_QUEUES.SITE_GENERATION,
        defaultJobOptions: { attempts: 3, backoff: { type: 'exponential', delay: 2000 } },
      },
      {
        name: AI_QUEUES.CMS_GENERATION,
        defaultJobOptions: { attempts: 3, backoff: { type: 'exponential', delay: 2000 } },
      },
      {
        name: AI_QUEUES.AGENT_TASKS,
        defaultJobOptions: { attempts: 3, backoff: { type: 'exponential', delay: 2000 } },
      },
      {
        name: AI_QUEUES.CAREER_COACHING,
        defaultJobOptions: { attempts: 3, backoff: { type: 'exponential', delay: 2000 } },
      },
      {
        name: AI_QUEUES.MOCK_INTERVIEW,
        defaultJobOptions: { attempts: 3, backoff: { type: 'exponential', delay: 2000 } },
      },
    ),
    GenerationModule,
    RecruitmentModule,
    AgentModule,
    PrismaModule,
  ],
  providers: [
    AnalysisWorker,
    SiteGenerationWorker,
    CmsGenerationWorker,
    AgentWorker,
    CareerCoachingWorker,
    MockInterviewWorker,
  ],
  exports: [BullModule],
})
export class WorkersModule {}
