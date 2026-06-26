import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { KafkaModule } from "@genzite/kafka";
import { PrismaModule } from "./prisma/prisma.module.js";
import { SitesController } from "./sites/sites.controller.js";
import { SitesService } from "./sites/sites.service.js";
import { PagesController } from "./pages/pages.controller.js";
import { PagesService } from "./pages/pages.service.js";
import { WidgetsController } from "./widgets/widgets.controller.js";
import { WidgetsService } from "./widgets/widgets.service.js";
import { SiteProducer } from "./events/site.producer.js";
import { AiConsumer } from "./events/ai.consumer.js";
import { PagesManagementController } from "./pages/pages-management.controller.js";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    KafkaModule.forRoot(),
    PrismaModule,
  ],
  controllers: [
    SitesController,
    PagesController,
    PagesManagementController,
    WidgetsController,
  ],
  providers: [SitesService, PagesService, WidgetsService, SiteProducer, AiConsumer],
})
export class AppModule {}
