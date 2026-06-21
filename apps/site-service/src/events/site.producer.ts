import { Injectable } from '@nestjs/common';
import { KafkaProducerService } from '@genzite/kafka';
import { KAFKA_TOPICS } from '@genzite/shared-types';

@Injectable()
export class SiteProducer {
  constructor(private readonly kafka: KafkaProducerService) {}

  async emitSiteCreated(payload: { siteId: string; name: string; subdomain: string; ownerId: string }) {
    await this.kafka.emit(KAFKA_TOPICS.SITE_CREATED, payload);
  }

  async emitPageUpdated(payload: { pageId: string; siteId: string; title: string }) {
    await this.kafka.emit(KAFKA_TOPICS.PAGE_UPDATED, payload);
  }
}
