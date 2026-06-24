import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { GeminiModule } from '../gemini/gemini.module.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { AI_QUEUES } from '../workers/queue.constants.js';
import { RecruitmentController } from './recruitment.controller.js';
import { CvAnalyzerService } from './cv-analyzer.service.js';
import { MockInterviewService } from './mock-interview.service.js';
import { CareerCoachService } from './career-coach.service.js';

@Module({
  imports: [
    GeminiModule,
    PrismaModule,
    BullModule.registerQueue({ name: AI_QUEUES.CV_ANALYSIS }),
    BullModule.registerQueue({ name: AI_QUEUES.CAREER_COACHING }),
    BullModule.registerQueue({ name: AI_QUEUES.MOCK_INTERVIEW }),
  ],
  controllers: [RecruitmentController],
  providers: [CvAnalyzerService, MockInterviewService, CareerCoachService],
  exports: [CvAnalyzerService, MockInterviewService, CareerCoachService],
})
export class RecruitmentModule {}
