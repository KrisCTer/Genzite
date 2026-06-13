import { Module } from '@nestjs/common';
import { CollectionsController } from './collections/collections.controller.js';
import { CollectionsService } from './collections/collections.service.js';
import { RecordsController } from './records/records.controller.js';
import { RecordsService } from './records/records.service.js';

@Module({
  imports: [],
  controllers: [CollectionsController, RecordsController],
  providers: [CollectionsService, RecordsService],
})
export class AppModule {}
