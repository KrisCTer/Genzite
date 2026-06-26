import { Module } from '@nestjs/common';
import { GeminiModule } from '../gemini/gemini.module.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { PipelineRunner } from './pipeline.runner.js';
import { CvAnalysisPipeline } from './pipelines/cv-analysis.pipeline.js';
import { SiteBuilderPipeline } from './pipelines/site-builder.pipeline.js';

@Module({
  imports: [GeminiModule, PrismaModule],
  providers: [PipelineRunner, CvAnalysisPipeline, SiteBuilderPipeline],
  exports: [PipelineRunner, CvAnalysisPipeline, SiteBuilderPipeline],
})
export class PipelineModule {}
