import { Injectable } from '@nestjs/common';
import { KafkaProducerService } from '@genzite/kafka';
import { KAFKA_TOPICS } from '@genzite/shared-types';

@Injectable()
export class IdentityProducer {
  constructor(private readonly kafka: KafkaProducerService) {}

  async emitUserRegistered(payload: { userId: string; email: string; name: string }) {
    await this.kafka.emit(KAFKA_TOPICS.USER_REGISTERED, payload);
  }

  async emitUserUpdated(payload: { userId: string; changes: Record<string, unknown> }) {
    await this.kafka.emit(KAFKA_TOPICS.USER_UPDATED, payload);
  }

  async emitRoleAssigned(payload: { userId: string; roleName: string; adminId?: string }) {
    await this.kafka.emit(KAFKA_TOPICS.ROLE_ASSIGNED, payload);
  }

  async emitCreditsAdjusted(payload: { userId: string; adminId: string; amount: number; newBalance: number }) {
    await this.kafka.emit(KAFKA_TOPICS.CREDITS_ADJUSTED, payload);
  }
}
