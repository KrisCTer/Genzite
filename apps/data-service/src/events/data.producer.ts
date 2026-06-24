import { Injectable } from '@nestjs/common';
import { KafkaProducerService } from '@genzite/kafka';
import { KAFKA_TOPICS } from '@genzite/shared-types';

@Injectable()
export class DataProducer {
  constructor(private readonly kafka: KafkaProducerService) {}

  async emitCollectionCreated(payload: {
    collectionId: string;
    siteId: string;
    name: string;
  }): Promise<void> {
    await this.kafka.emit(KAFKA_TOPICS.COLLECTION_CREATED, payload);
  }

  async emitCollectionUpdated(payload: {
    collectionId: string;
    siteId: string;
    name: string;
  }): Promise<void> {
    await this.kafka.emit(KAFKA_TOPICS.COLLECTION_UPDATED, payload);
  }

  async emitCollectionDeleted(payload: {
    collectionId: string;
    siteId: string;
  }): Promise<void> {
    await this.kafka.emit(KAFKA_TOPICS.COLLECTION_DELETED, payload);
  }

  async emitRecordCreated(payload: {
    recordId: string;
    collectionId: string;
    createdBy: string;
  }): Promise<void> {
    await this.kafka.emit(KAFKA_TOPICS.RECORD_CREATED, payload);
  }

  async emitRecordUpdated(payload: {
    recordId: string;
    collectionId: string;
    updatedBy: string;
  }): Promise<void> {
    await this.kafka.emit(KAFKA_TOPICS.RECORD_UPDATED, payload);
  }

  async emitRecordDeleted(payload: {
    recordId: string;
    collectionId: string;
  }): Promise<void> {
    await this.kafka.emit(KAFKA_TOPICS.RECORD_DELETED, payload);
  }
}
