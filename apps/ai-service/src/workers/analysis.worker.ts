import { Logger } from '@nestjs/common';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { CvAnalyzerService } from '../recruitment/cv-analyzer.service.js';
import { AiProducer } from '../events/ai.producer.js';
import { AI_QUEUES } from './queue.constants.js';

export interface CvAnalysisJobData {
  resumeId: string;
  jobDescription: string;
  ownerId: string;
  model?: string;
}

/**
 * BullMQ processor for CV analysis tasks.
 * Consumes jobs from Redis queue, calls AI via CvAnalyzerService,
 * then emits Kafka event to notify downstream services.
 */
@Processor(AI_QUEUES.CV_ANALYSIS)
export class AnalysisWorker extends WorkerHost {
  private readonly logger = new Logger(AnalysisWorker.name);

  constructor(
    private readonly cvAnalyzer: CvAnalyzerService,
    private readonly aiProducer: AiProducer,
  ) {
    super();
  }

  async process(job: Job<CvAnalysisJobData>): Promise<void> {
    const { resumeId, jobDescription, ownerId, model } = job.data;
    this.logger.log(`Processing CV analysis: resume=${resumeId}, job=${job.id}`);

    const result = await this.cvAnalyzer.analyze(resumeId, jobDescription, ownerId, model);

    await this.aiProducer.emitResumeAnalyzed({
      resumeId,
      ownerId,
      atsScore: result.atsScore,
    });

    this.logger.log(`CV analysis completed: resume=${resumeId}, ATS=${result.atsScore}`);
  }
}
