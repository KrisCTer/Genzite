import { Injectable } from '@nestjs/common';

@Injectable()
export class PushService {
  async sendPush(userId: string, title: string, body: string) {
    // TODO: Integrate with Firebase Cloud Messaging or similar
    console.log(`[Push] Sending to user ${userId}: ${title}`);
  }
}
