import { Injectable, Logger } from "@nestjs/common";

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  async sendEmail(to: string, subject: string, body: string) {
    this.logger.log(`Mock email -> ${to} | Subject: ${subject}`);
  }
}
