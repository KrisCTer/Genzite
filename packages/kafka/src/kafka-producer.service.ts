import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kafka, Producer, CompressionTypes } from 'kafkajs';
import { v4 as uuid } from 'uuid';
import type { KafkaTopicName } from '@genzite/shared-types';

@Injectable()
export class KafkaProducerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KafkaProducerService.name);
  private readonly kafka: Kafka;
  private readonly producer: Producer;
  private readonly serviceName: string;

  constructor(private readonly config: ConfigService) {
    const brokers = this.config.getOrThrow<string>('KAFKA_BROKERS').split(',');
    this.serviceName = this.config.get<string>('SERVICE_NAME', 'unknown-service');

    this.kafka = new Kafka({
      clientId: this.serviceName,
      brokers,
      retry: {
        initialRetryTime: 300,
        retries: 5,
      },
    });

    this.producer = this.kafka.producer();
  }

  async onModuleInit() {
    await this.producer.connect();
    this.logger.log(`Kafka producer connected (service: ${this.serviceName})`);
  }

  async onModuleDestroy() {
    await this.producer.disconnect();
    this.logger.log('Kafka producer disconnected');
  }

  async emit<T extends Record<string, unknown>>(
    topic: KafkaTopicName,
    payload: T,
  ): Promise<void> {
    const event = {
      eventId: uuid(),
      timestamp: new Date().toISOString(),
      source: this.serviceName,
      type: topic,
      payload,
    };

    await this.producer.send({
      topic,
      compression: CompressionTypes.GZIP,
      messages: [
        {
          key: event.eventId,
          value: JSON.stringify(event),
        },
      ],
    });

    this.logger.debug(`Event emitted → ${topic} (id: ${event.eventId})`);
  }
}
