import { Injectable } from '@nestjs/common';

/**
 * BullMQ worker for processing CV analysis tasks.
 */
@Injectable()
export class AnalysisWorker {
  async processAnalyzeCv(jobData: { resumeId: string; jobDescription: string; ownerId: string }) {
    // TODO: Consume from BullMQ queue, call Gemini, save ATS scores to DB
    console.log('[AI Worker] Processing CV analysis for resume:', jobData.resumeId);
  }
}
