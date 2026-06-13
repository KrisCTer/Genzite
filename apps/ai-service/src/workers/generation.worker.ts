import { Injectable } from '@nestjs/common';

/**
 * BullMQ worker for processing long-running AI generation tasks.
 */
@Injectable()
export class GenerationWorker {
  async processGenerateSite(jobData: { prompt: string; ownerId: string }) {
    // TODO: Consume from BullMQ queue, call Gemini, save results to DB
    console.log('[AI Worker] Processing site generation for:', jobData.prompt.substring(0, 50));
  }

  async processGenerateCms(jobData: { siteId: string; prompt: string; ownerId: string }) {
    // TODO: Consume from BullMQ queue, call Gemini, save results to DB
    console.log('[AI Worker] Processing CMS generation for site:', jobData.siteId);
  }
}
