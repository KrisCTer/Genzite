import { Logger } from '@nestjs/common';
import { Processor, WorkerHost, InjectQueue } from '@nestjs/bullmq';
import { Job, Queue } from 'bullmq';
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

// Dynamic limiter calculation: Each key handles 10 requests/minute (safe threshold, actual limit is 15)
const keyCount = (process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || '').split(',').filter(k => k.trim().length > 0).length || 1;
const dynamicMaxRequests = keyCount * 10;

/**
 * BullMQ processor for site generation tasks.
 * Consumes jobs from Redis queue, calls AI via SiteGeneratorService,
 * then emits Kafka event to notify downstream services.
 */
@Processor(AI_QUEUES.SITE_GENERATION, {
  limiter: {
    max: dynamicMaxRequests,
    duration: 60000,
  }
})
export class SiteGenerationWorker extends WorkerHost {
  private readonly logger = new Logger(SiteGenerationWorker.name);

  constructor(
    private readonly siteGenerator: SiteGeneratorService,
    private readonly aiProducer: AiProducer,
    @InjectQueue(AI_QUEUES.CMS_GENERATION) private readonly cmsQueue: Queue,
  ) {
    super();
  }

  async process(job: Job<SiteGenerationJobData>): Promise<any> {
    const { prompt, ownerId, model } = job.data;
    this.logger.log(`Processing site generation: job=${job.id}, owner=${ownerId}`);

    const result = await this.siteGenerator.generate(
      prompt, 
      ownerId, 
      model,
      async (step, percent) => {
        await job.updateProgress({ step, percent });
      }
    );

    await this.aiProducer.emitSiteGenerated({
      siteId: result.site.subdomain,
      prompt,
      ownerId,
      siteData: result,
    });

    // Auto-trigger CMS Generation for dynamic data-binding
    await this.cmsQueue.add('generate', {
      siteId: result.site.subdomain,
      prompt,
      ownerId,
      model,
    });

    this.logger.log(`Site generated: "${result.site.name}" with ${result.pages.length} pages`);
    return result;
  }
}

/**
 * BullMQ processor for CMS schema generation tasks.
 */
@Processor(AI_QUEUES.CMS_GENERATION, {
  limiter: {
    max: dynamicMaxRequests,
    duration: 60000,
  }
})
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
