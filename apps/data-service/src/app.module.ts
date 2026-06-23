import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { KafkaModule } from '@genzite/kafka';
import { PrismaModule } from './prisma/prisma.module.js';
import { ValidationModule } from './validation/validation.module.js';
import { EventsModule } from './events/events.module.js';
import { CollectionsController } from './collections/collections.controller.js';
import { CollectionsService } from './collections/collections.service.js';
import { RecordsController } from './records/records.controller.js';
import { RecordsService } from './records/records.service.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    KafkaModule.forRoot(),
    PrismaModule,
    ValidationModule,
    EventsModule,
  ],
  controllers: [CollectionsController, RecordsController],
  providers: [CollectionsService, RecordsService],
})
export class AppModule {}
