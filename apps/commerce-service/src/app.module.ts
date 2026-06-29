import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { KafkaModule } from "@genzite/kafka";
import { PrismaModule } from "./prisma/prisma.module.js";
import { OrdersController } from "./orders/orders.controller.js";
import { OrdersService } from "./orders/orders.service.js";
import { PaymentsController } from "./payments/payments.controller.js";
import { PaymentsService } from "./payments/payments.service.js";
import { CommerceProducer } from "./events/commerce.producer.js";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    KafkaModule.forRoot({ enableConsumer: true }),
    PrismaModule,
  ],
  controllers: [
    OrdersController,
    PaymentsController,
  ],
  providers: [OrdersService, PaymentsService, CommerceProducer],
})
export class AppModule {}
