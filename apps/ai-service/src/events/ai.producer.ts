import { Injectable, Logger } from '@nestjs/common';
import { KafkaProducerService } from '@genzite/kafka';
import { KAFKA_TOPICS } from '@genzite/shared-types';

@Injectable()
export class AiProducer {
  private readonly logger = new Logger(AiProducer.name);

  constructor(private readonly kafka: KafkaProducerService) {}

  async emitSiteGenerated(payload: { siteId: string; prompt: string; ownerId: string }) {
    await this.kafka.emit(KAFKA_TOPICS.SITE_GENERATED, payload);
    this.logger.log(`Event emitted: ${KAFKA_TOPICS.SITE_GENERATED} (site: ${payload.siteId})`);
  }

  async emitResumeAnalyzed(payload: { resumeId: string; ownerId: string; atsScore: number }) {
    await this.kafka.emit(KAFKA_TOPICS.RESUME_ANALYZED, payload);
    this.logger.log(`Event emitted: ${KAFKA_TOPICS.RESUME_ANALYZED} (resume: ${payload.resumeId}, score: ${payload.atsScore})`);
  }

  async emitInterviewCompleted(payload: { sessionId: string; resumeId: string; ownerId: string; overallScore: number }) {
    await this.kafka.emit(KAFKA_TOPICS.INTERVIEW_COMPLETED, payload);
    this.logger.log(`Event emitted: ${KAFKA_TOPICS.INTERVIEW_COMPLETED} (session: ${payload.sessionId}, score: ${payload.overallScore})`);
  }
}
