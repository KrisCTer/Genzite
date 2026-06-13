import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailService {
  async sendEmail(to: string, subject: string, body: string) {
    // TODO: Integrate with AWS SES or SMTP provider
    console.log(`[Email] Sending to ${to}: ${subject}`);
  }
}
