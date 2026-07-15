import { Controller, Logger, OnModuleInit } from "@nestjs/common";
import { KafkaConsumerService } from "@genzite/kafka";
import { NotificationsService } from "../in-app/notifications.service.js";
import {
  KAFKA_TOPICS,
  SiteGeneratedEvent,
  CmsGeneratedEvent,
} from "@genzite/shared-types";

@Controller()
export class AiConsumer implements OnModuleInit {
  private readonly logger = new Logger(AiConsumer.name);

  constructor(
    private readonly kafkaConsumer: KafkaConsumerService,
    private readonly notificationsService: NotificationsService,
  ) {}

  onModuleInit() {
    this.kafkaConsumer.subscribe<SiteGeneratedEvent["payload"]>(
      KAFKA_TOPICS.SITE_GENERATED,
      async (event) => {
        this.logger.log(`Site generated → ${event.payload.ownerId}`);
        await this.notificationsService.createSiteGeneratedNotification(
          event.payload.ownerId,
          event.payload.siteId,
        );
        this.logger.log(`Site generated notification created for ${event.payload.ownerId}`);
      },
    );

    this.kafkaConsumer.subscribe<CmsGeneratedEvent["payload"]>(
      KAFKA_TOPICS.CMS_GENERATED,
      async (event) => {
        this.logger.log(`CMS generated → ${event.payload.ownerId}`);
        await this.notificationsService.createCmsGeneratedNotification(
          event.payload.ownerId,
          event.payload.siteId,
        );
        this.logger.log(`CMS generated notification created for ${event.payload.ownerId}`);
      },
    );
  }
}
