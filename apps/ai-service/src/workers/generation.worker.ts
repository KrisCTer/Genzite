import { Logger } from '@nestjs/common';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { SiteGeneratorService } from '../generation/site-generator.service.js';
import { CmsGeneratorService } from '../generation/cms-generator.service.js';
import { AiProducer } from '../events/ai.producer.js';
import { AI_QUEUES } from './queue.constants.js';

export interface SiteGenerationJobData {
  prompt: string;
  ownerId: string;
  model?: string;
}

export interface CmsGenerationJobData {
  siteId: string;
  prompt: string;
  ownerId: string;
  model?: string;
}

/**
 * BullMQ processor for site generation tasks.
 * Consumes jobs from Redis queue, calls AI via SiteGeneratorService,
 * then emits Kafka event to notify downstream services.
 */
@Processor(AI_QUEUES.SITE_GENERATION)
export class SiteGenerationWorker extends WorkerHost {
  private readonly logger = new Logger(SiteGenerationWorker.name);

  constructor(
    private readonly siteGenerator: SiteGeneratorService,
    private readonly aiProducer: AiProducer,
  ) {
    super();
  }

  async process(job: Job<SiteGenerationJobData>): Promise<void> {
    const { prompt, ownerId, model } = job.data;
    this.logger.log(`Processing site generation: job=${job.id}, owner=${ownerId}`);

    const result = await this.siteGenerator.generate(prompt, ownerId, model);

    await this.aiProducer.emitSiteGenerated({
      siteId: result.site.subdomain,
      prompt,
      ownerId,
    });

    this.logger.log(`Site generated: "${result.site.name}" with ${result.pages.length} pages`);
  }
}

/**
 * BullMQ processor for CMS schema generation tasks.
 */
@Processor(AI_QUEUES.CMS_GENERATION)
export class CmsGenerationWorker extends WorkerHost {
  private readonly logger = new Logger(CmsGenerationWorker.name);

  constructor(
    private readonly cmsGenerator: CmsGeneratorService,
    private readonly aiProducer: AiProducer,
  ) {
    super();
  }

  async process(job: Job<CmsGenerationJobData>): Promise<void> {
    const { siteId, prompt, ownerId, model } = job.data;
    this.logger.log(`Processing CMS generation: job=${job.id}, site=${siteId}`);

    const result = await this.cmsGenerator.generate(siteId, prompt, ownerId, model);

    await this.aiProducer.emitCmsGenerated({
      siteId,
      prompt,
      ownerId,
    });

    this.logger.log(`CMS generated: site=${siteId}, ${result.collections.length} collections`);
  }
}
