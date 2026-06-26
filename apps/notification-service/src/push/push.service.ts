import { Injectable } from '@nestjs/common';

@Injectable()
export class PushService {
  async sendPush(userId: string, title: string, body: string) {
    console.log(`[Push] Sending to user ${userId}: ${title}`);
  }
}
