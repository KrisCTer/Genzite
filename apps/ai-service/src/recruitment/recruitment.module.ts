import { Module } from '@nestjs/common';
import { GeminiModule } from '../gemini/gemini.module.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { RecruitmentController } from './recruitment.controller.js';
import { CvAnalyzerService } from './cv-analyzer.service.js';
import { MockInterviewService } from './mock-interview.service.js';
import { CareerCoachService } from './career-coach.service.js';

@Module({
  imports: [GeminiModule, PrismaModule],
  controllers: [RecruitmentController],
  providers: [CvAnalyzerService, MockInterviewService, CareerCoachService],
  exports: [CvAnalyzerService, MockInterviewService, CareerCoachService],
})
export class RecruitmentModule {}
