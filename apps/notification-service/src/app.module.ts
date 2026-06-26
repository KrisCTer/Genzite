import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { KafkaModule } from "@genzite/kafka";
import { PrismaModule } from "./prisma/prisma.module.js";
import { NotificationsController } from "./in-app/notifications.controller.js";
import { NotificationsService } from "./in-app/notifications.service.js";
import { UserConsumer } from "./consumers/user.consumer.js";
import { EmailService } from "./email/email.service.js";
import { AiConsumer } from "./consumers/ai.consumer.js";
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    KafkaModule.forRoot({ enableConsumer: true }),
    PrismaModule,
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService, EmailService, UserConsumer, AiConsumer],
})
export class AppModule {}
