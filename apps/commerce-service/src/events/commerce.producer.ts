import { Injectable, Logger } from '@nestjs/common';
import { KafkaProducerService } from '@genzite/kafka';

@Injectable()
export class CommerceProducer {
  private readonly logger = new Logger(CommerceProducer.name);

  constructor(private readonly kafka: KafkaProducerService) {}

  async emitOrderCreated(payload: { orderId: string; siteId: string; total: number; customerEmail: string }) {
    await this.kafka.emit('order.created', payload);
    this.logger.log(`Event emitted: order.created (order: ${payload.orderId})`);
  }

  async emitPaymentCompleted(payload: { orderId: string; siteId: string; amount: number; gateway: string }) {
    await this.kafka.emit('payment.completed', payload);
    this.logger.log(`Event emitted: payment.completed (order: ${payload.orderId})`);
  }
}
