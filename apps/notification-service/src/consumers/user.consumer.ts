import { Injectable } from '@nestjs/common';

/**
 * Listens to Kafka events from other services and triggers notifications.
 */
@Injectable()
export class UserConsumer {
  async handleUserRegistered(payload: { userId: string; email: string; name: string }) {
    // TODO: Send welcome email
    console.log('[Notification] Consumed: user.registered → Sending welcome email to', payload.email);
  }
}
