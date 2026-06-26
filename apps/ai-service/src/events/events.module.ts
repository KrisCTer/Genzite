import { Module, Global } from '@nestjs/common';
import { AiProducer } from './ai.producer.js';

@Global()
@Module({
  providers: [AiProducer],
  exports: [AiProducer],
})
export class EventsModule {}
