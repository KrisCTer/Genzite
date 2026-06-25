import { Injectable } from "@nestjs/common";
import { KafkaProducerService } from "@genzite/kafka";
import { KAFKA_TOPICS } from "@genzite/shared-types";

@Injectable()
export class MediaProducer {
  constructor(
    // Kafka producer used to publish domain events.
    private readonly kafkaProducer: KafkaProducerService,
  ) {}

  async emitMediaUploaded(payload: {
    mediaId: string;
    s3Key: string;
    filename: string;
    mimeType: string;
    ownerId: string;
  }) {
    // Notify other services that a new media file has been uploaded.
    await this.kafkaProducer.emit(KAFKA_TOPICS.MEDIA_UPLOADED, payload);
  }
  // Notify other services that a media file has been deleted.
  async emitMediaDeleted(payload: {
    mediaId: string;
    s3Key: string;
    ownerId: string;
  }) {
    await this.kafkaProducer.emit(KAFKA_TOPICS.MEDIA_DELETED, payload);
  }
}
