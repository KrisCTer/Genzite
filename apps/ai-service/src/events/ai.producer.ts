import { Injectable, Logger } from '@nestjs/common';
import { KafkaProducerService } from '@genzite/kafka';
import { KAFKA_TOPICS } from '@genzite/shared-types';

@Injectable()
export class AiProducer {
  private readonly logger = new Logger(AiProducer.name);

  constructor(private readonly kafka: KafkaProducerService) {}

  async emitSiteGenerated(payload: { siteId: string; prompt: string; ownerId: string; siteData?: any }) {
    await this.kafka.emit(KAFKA_TOPICS.SITE_GENERATED, payload);
    this.logger.log(`Event emitted: ${KAFKA_TOPICS.SITE_GENERATED} (site: ${payload.siteId})`);
  }

  async emitCmsGenerated(payload: { siteId: string; prompt: string; ownerId: string }) {
    await this.kafka.emit(KAFKA_TOPICS.CMS_GENERATED, payload);
    this.logger.log(`Event emitted: ${KAFKA_TOPICS.CMS_GENERATED} (site: ${payload.siteId})`);
  }
}

