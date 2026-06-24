import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { GeminiModule } from '../gemini/gemini.module.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { AI_QUEUES } from '../workers/queue.constants.js';
import { GenerationController } from './generation.controller.js';
import { SiteGeneratorService } from './site-generator.service.js';
import { CmsGeneratorService } from './cms-generator.service.js';

@Module({
  imports: [
    GeminiModule,
    PrismaModule,
    BullModule.registerQueue(
      { name: AI_QUEUES.SITE_GENERATION },
      { name: AI_QUEUES.CMS_GENERATION },
    ),
  ],
  controllers: [GenerationController],
  providers: [SiteGeneratorService, CmsGeneratorService],
  exports: [SiteGeneratorService, CmsGeneratorService],
})
export class GenerationModule {}
