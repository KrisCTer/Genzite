import { DynamicModule, Module, Provider } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { KafkaProducerService } from './kafka-producer.service.js';
import { KafkaConsumerService } from './kafka-consumer.service.js';

export interface KafkaModuleOptions {
  /** Enable consumer (requires KAFKA_CONSUMER_GROUP env). Default: false (producer-only) */
  enableConsumer?: boolean;
}

@Module({})
export class KafkaModule {
  /**
   * Register Kafka module for a service.
   * Producer is always available. Consumer is opt-in.
   *
   * Producer-only (default):
   *   KafkaModule.forRoot()
   *
   * Producer + Consumer:
   *   KafkaModule.forRoot({ enableConsumer: true })
   */
  static forRoot(options: KafkaModuleOptions = {}): DynamicModule {
    const providers: Provider[] = [KafkaProducerService];
    const moduleExports: Provider[] = [KafkaProducerService];

    if (options.enableConsumer) {
      providers.push(KafkaConsumerService);
      moduleExports.push(KafkaConsumerService);
    }

    return {
      module: KafkaModule,
      imports: [ConfigModule],
      providers,
      exports: moduleExports,
      global: true,
    };
  }
}
