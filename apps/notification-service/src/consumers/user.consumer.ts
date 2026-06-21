import { Controller, Logger, OnModuleInit } from '@nestjs/common';
import { KafkaConsumerService } from '@genzite/kafka';
import { KAFKA_TOPICS } from '@genzite/shared-types';
import type { UserRegisteredEvent, SiteCreatedEvent } from '@genzite/shared-types';

/**
 * Listens to Kafka events from other services and triggers notifications.
 */
@Controller()
export class UserConsumer implements OnModuleInit {
  private readonly logger = new Logger(UserConsumer.name);

  constructor(private readonly kafkaConsumer: KafkaConsumerService) {}

  onModuleInit() {
    this.kafkaConsumer.subscribe<UserRegisteredEvent['payload']>(
      KAFKA_TOPICS.USER_REGISTERED,
      async (event) => {
        this.logger.log(`Welcome email → ${event.payload.email} (user: ${event.payload.userId})`);
        // TODO: Call email service to send welcome email
      },
    );

    this.kafkaConsumer.subscribe<SiteCreatedEvent['payload']>(
      KAFKA_TOPICS.SITE_CREATED,
      async (event) => {
        this.logger.log(`Site created notification → owner: ${event.payload.ownerId}, site: ${event.payload.name}`);
        // TODO: Create in-app notification for site owner
      },
    );
  }
}
