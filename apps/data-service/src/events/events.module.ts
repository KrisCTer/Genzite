import { Module } from '@nestjs/common';
import { DataProducer } from './data.producer.js';

@Module({
  providers: [DataProducer],
  exports: [DataProducer],
})
export class EventsModule {}
