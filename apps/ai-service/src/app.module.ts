import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module.js';
import { GenerationController } from './generation/generation.controller.js';
import { SiteGeneratorService } from './generation/site-generator.service.js';
import { CmsGeneratorService } from './generation/cms-generator.service.js';
import { RecruitmentController } from './recruitment/recruitment.controller.js';
import { CvAnalyzerService } from './recruitment/cv-analyzer.service.js';
import { MockInterviewService } from './recruitment/mock-interview.service.js';
import { CareerCoachService } from './recruitment/career-coach.service.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
  ],
  controllers: [GenerationController, RecruitmentController],
  providers: [
    SiteGeneratorService,
    CmsGeneratorService,
    CvAnalyzerService,
    MockInterviewService,
    CareerCoachService,
  ],
})
export class AppModule {}
