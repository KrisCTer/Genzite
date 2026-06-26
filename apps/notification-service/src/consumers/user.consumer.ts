import { Controller, Logger, OnModuleInit } from "@nestjs/common";
import { KafkaConsumerService } from "@genzite/kafka";
import { KAFKA_TOPICS } from "@genzite/shared-types";
import type {
  UserRegisteredEvent,
  SiteCreatedEvent,
} from "@genzite/shared-types";
import { NotificationsService } from "../in-app/notifications.service.js";
import { EmailService } from "../email/email.service.js";

/**
 * Listens to Kafka events from other services and triggers notifications.
 */
@Controller()
export class UserConsumer implements OnModuleInit {
  private readonly logger = new Logger(UserConsumer.name);

  constructor(
    private readonly kafkaConsumer: KafkaConsumerService,
    private readonly notificationsService: NotificationsService,
    private readonly emailService: EmailService,
  ) {}

  onModuleInit() {
    this.logger.log("UserConsumer initialized");
    this.kafkaConsumer.subscribe<UserRegisteredEvent["payload"]>(
      KAFKA_TOPICS.USER_REGISTERED,
      async (event) => {
        this.logger.log(
          `Welcome email → ${event.payload.email} (user: ${event.payload.userId})`,
        );

        await this.notificationsService.createWelcomeNotification(
          event.payload.userId,
        );

        this.logger.log(
          `Welcome notification created for ${event.payload.userId}`,
        );

        await this.emailService.sendEmail(
          event.payload.email,
          "Chào mừng đến với Genzite!",
          "Cảm ơn bạn đã đăng ký tài khoản.",
        );
      },
    );

    this.kafkaConsumer.subscribe<SiteCreatedEvent["payload"]>(
      KAFKA_TOPICS.SITE_CREATED,
      async (event) => {
        this.logger.log(
          `Site created notification → owner: ${event.payload.ownerId}, site: ${event.payload.name}`,
        );

        await this.notificationsService.createSiteCreatedNotification(
          event.payload.ownerId,
          event.payload.siteId,
          event.payload.name,
        );

        this.logger.log(
          `Site notification created for ${event.payload.ownerId}`,
        );
      },
    );
  }
}
