import { Controller, Logger, OnModuleInit } from "@nestjs/common";
import { KafkaConsumerService } from "@genzite/kafka";
import { KAFKA_TOPICS } from "@genzite/shared-types";
import type { SiteInvitedEvent, FeedbackSubmittedEvent } from "@genzite/shared-types";
import { EmailService } from "../email/email.service.js";

/**
 * Listens to Kafka site events and triggers notifications.
 */
@Controller()
export class SiteConsumer implements OnModuleInit {
  private readonly logger = new Logger(SiteConsumer.name);

  constructor(
    private readonly kafkaConsumer: KafkaConsumerService,
    private readonly emailService: EmailService,
  ) {}

  onModuleInit() {
    this.logger.log("SiteConsumer initialized");

    this.kafkaConsumer.subscribe<SiteInvitedEvent["payload"]>(
      KAFKA_TOPICS.SITE_INVITED,
      async (event) => {
        this.logger.log(
          `Site invite email → To: ${event.payload.invitedEmail} from: ${event.payload.inviterEmail} for site: ${event.payload.siteName}`,
        );

        await this.emailService.sendSiteInviteEmail(event.payload);
      },
    );

    this.kafkaConsumer.subscribe<FeedbackSubmittedEvent["payload"]>(
      KAFKA_TOPICS.FEEDBACK_SUBMITTED,
      async (event) => {
        this.logger.log(
          `Feedback submitted by ${event.payload.userEmail} for site ${event.payload.siteId}`,
        );

        await this.emailService.sendFeedbackEmail(event.payload);
      },
    );
  }
}
