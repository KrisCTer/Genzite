import { Controller, Post, Body, Param, Headers } from '@nestjs/common';
import { PaymentsService } from './payments.service.js';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post(':orderId/session')
  async createSession(
    @Param('orderId') orderId: string,
    @Headers('x-site-id') siteId: string,
  ) {
    return this.paymentsService.createPaymentSession(siteId, orderId);
  }

  // Webhook endpoint (public, no auth middleware ideally, but protected by signature)
  @Post('webhook/payos')
  async handlePayOSWebhook(@Body() body: any) {
    return this.paymentsService.handlePayOSWebhook(body);
  }
}
