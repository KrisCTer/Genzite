import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kafka, Consumer, EachMessagePayload } from 'kafkajs';
import type { KafkaTopicName, BaseEvent } from '@genzite/shared-types';

export type EventHandler<T = unknown> = (event: BaseEvent & { payload: T }) => Promise<void>;

@Injectable()
export class KafkaConsumerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KafkaConsumerService.name);
  private readonly kafka: Kafka;
  private readonly consumer: Consumer;
  private readonly handlers = new Map<string, EventHandler[]>();

  constructor(private readonly config: ConfigService) {
    const brokers = this.config.getOrThrow<string>('KAFKA_BROKERS').split(',');
    const groupId = this.config.getOrThrow<string>('KAFKA_CONSUMER_GROUP');

    this.kafka = new Kafka({
      clientId: `${groupId}-client`,
      brokers,
      retry: {
        initialRetryTime: 300,
        retries: 5,
      },
    });

    this.consumer = this.kafka.consumer({ groupId });
  }

  async onModuleInit() {
    const topics = Array.from(this.handlers.keys());

    if (topics.length === 0) {
      this.logger.warn('No Kafka topics registered — consumer will not start');
      return;
    }

    await this.consumer.connect();
    this.logger.log(`Kafka consumer connected (group: ${this.config.get('KAFKA_CONSUMER_GROUP')})`);

    for (const topic of topics) {
      await this.consumer.subscribe({ topic, fromBeginning: false });
      this.logger.log(`Subscribed to topic: ${topic}`);
    }

    await this.consumer.run({
      eachMessage: async (messagePayload: EachMessagePayload) => {
        await this.handleMessage(messagePayload);
      },
    });
  }

  async onModuleDestroy() {
    await this.consumer.disconnect();
    this.logger.log('Kafka consumer disconnected');
  }

  subscribe<T>(topic: KafkaTopicName, handler: EventHandler<T>): void {
    const existing = this.handlers.get(topic) ?? [];
    existing.push(handler as EventHandler);
    this.handlers.set(topic, existing);
  }

  private async handleMessage({ topic, message }: EachMessagePayload): Promise<void> {
    const handlers = this.handlers.get(topic);
    if (!handlers || handlers.length === 0) return;

    const value = message.value?.toString();
    if (!value) {
      this.logger.warn(`Empty message on topic: ${topic}`);
      return;
    }

    try {
      const event = JSON.parse(value);
      this.logger.debug(`Event received ← ${topic} (id: ${event.eventId})`);

      for (const handler of handlers) {
        await handler(event);
      }
    } catch (error) {
      this.logger.error(
        `Failed to process message on topic ${topic}: ${error instanceof Error ? error.message : error}`,
        error instanceof Error ? error.stack : undefined,
      );
      // DLQ strategy: log and continue — don't block consumer
    }
  }
}
