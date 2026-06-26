import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PrismaModule } from "./prisma/prisma.module.js";
import { UploadController } from "./upload/upload.controller.js";
import { UploadService } from "./upload/upload.service.js";
import { RegistryController } from "./registry/registry.controller.js";
import { RegistryService } from "./registry/registry.service.js";
import { KafkaModule } from "@genzite/kafka";
import { MediaProducer } from "./events/media.producer.js";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    // Register Kafka producer for this service.
    // Register Kafka producer.
    // Consumer is disabled because Media Service only publishes events.
    KafkaModule.forRoot(),

    PrismaModule,
  ],
  controllers: [UploadController, RegistryController],
  providers: [
    UploadService,
    RegistryService,

    // Publish domain events to Kafka.
    MediaProducer,
  ],
})
export class AppModule {}
