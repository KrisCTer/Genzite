import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PrismaModule } from "./prisma/prisma.module.js";
import { ScheduleModule } from "@nestjs/schedule";
import { UploadController } from "./upload/upload.controller.js";
import { UploadService } from "./upload/upload.service.js";
import { RegistryController } from "./registry/registry.controller.js";
import { RegistryService } from "./registry/registry.service.js";
import { MediaCleanupCron } from "./registry/media-cleanup.cron.js";
import { KafkaModule } from "@genzite/kafka";
import { MediaProducer } from "./events/media.producer.js";
import { HealthController } from "./health/health.controller.js";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),

    // Register Kafka producer for this service.
    // Register Kafka producer.
    // Consumer is disabled because Media Service only publishes events.
    KafkaModule.forRoot(),

    PrismaModule,
  ],
  controllers: [HealthController, UploadController, RegistryController],
  providers: [
    UploadService,
    RegistryService,
    MediaCleanupCron,

    // Publish domain events to Kafka.
    MediaProducer,
  ],
})
export class AppModule {}
