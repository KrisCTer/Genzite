import { Module } from '@nestjs/common';
import { GeminiModule } from '../gemini/gemini.module.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { GenerationController } from './generation.controller.js';
import { SiteGeneratorService } from './site-generator.service.js';
import { CmsGeneratorService } from './cms-generator.service.js';

@Module({
  imports: [GeminiModule, PrismaModule],
  controllers: [GenerationController],
  providers: [SiteGeneratorService, CmsGeneratorService],
  exports: [SiteGeneratorService, CmsGeneratorService],
})
export class GenerationModule {}
