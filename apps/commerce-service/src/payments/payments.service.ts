import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CommerceProducer } from '../events/commerce.producer.js';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly producer: CommerceProducer,
  ) {}

  async createPaymentSession(siteId: string, orderId: string) {
    const order = await this.prisma.order.findFirst({ where: { id: orderId, siteId } });
    if (!order) throw new BadRequestException('Order not found');

    // --- DIRECT-TO-MERCHANT: Fetch PayOS Keys ---
    const siteServiceUrl = process.env.SITE_SERVICE_URL || 'http://localhost:3002';
    const siteResponse = await fetch(`${siteServiceUrl}/sites/internal/${siteId}/config`);
    if (!siteResponse.ok) throw new Error('Failed to fetch site config');
    const site = await siteResponse.json();
    
    const payosConfig = site.settings?.integrations?.payos;
    if (!payosConfig || !payosConfig.clientId) {
      throw new BadRequestException('Merchant has not configured PayOS integration');
    }

    // --- SaaS BILLING: Deduct Credits ---
    const FEE_CREDITS = 5;
    this.logger.log(`[SaaS Billing] Attempting to deduct ${FEE_CREDITS} credits from site owner ${site.ownerId}`);
    
    const identityServiceUrl = process.env.IDENTITY_SERVICE_URL || 'http://localhost:3001';
    const deductResponse = await fetch(`${identityServiceUrl}/users/internal/${site.ownerId}/deduct-credits`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: FEE_CREDITS })
    });
    
    if (!deductResponse.ok) {
      throw new BadRequestException('Merchant has insufficient credits to process payment');
    }

    this.logger.log(`[PayOS] Generating payment link for Order ${orderId} using Merchant's PayOS API Key`);

    const tx = await this.prisma.paymentTransaction.create({
      data: {
        siteId,
        orderId,
        gateway: 'payos',
        amount: order.total,
        status: 'PENDING',
      },
    });

    return { 
      transactionId: tx.id, 
      qrCodeUrl: `https://payos.vn/mock-qr?client=${payosConfig.clientId}&amount=${order.total}` 
    };
  }

  async handlePayOSWebhook(body: any) {
    const { orderCode, amount, success } = body.data || {};
    
    // We assume orderCode maps to our Order table
    const order = await this.prisma.order.findUnique({ where: { orderNumber: String(orderCode) } });
    if (!order) {
      this.logger.error(`Webhook received for unknown order: ${orderCode}`);
      return { error: 'Order not found' };
    }

    // --- SECURITY PATCH: Fake Webhook Verification ---
    // Fetch site settings to get merchant's Checksum Key
    const siteServiceUrl = process.env.SITE_SERVICE_URL || 'http://localhost:3002';
    const response = await fetch(`${siteServiceUrl}/sites/internal/${order.siteId}/config`);
    if (!response.ok) throw new Error('Failed to fetch site config for webhook verification');
    
    const site = await response.json();
    const payosConfig = site.settings?.integrations?.payos;
    if (!payosConfig || !payosConfig.clientId || !payosConfig.checksumKey) {
      this.logger.error(`PayOS integration missing for site ${order.siteId}`);
      return { error: 'Integration not found' };
    }

    // Verify Signature using @payos/node
    const PayOS = (await import('@payos/node')).default;
    const payos = new PayOS(payosConfig.clientId, payosConfig.apiKey, payosConfig.checksumKey);
    
    try {
      const webhookData = payos.verifyPaymentWebhookData(body);
      this.logger.log(`Webhook Signature Verified for Order: ${webhookData.orderCode}`);
    } catch (error) {
      this.logger.error(`Fake Webhook Detected! Signature verification failed for order ${orderCode}`);
      throw new BadRequestException('Invalid Webhook Signature');
    }

    if (!success) return { received: true };

    // 3. Update transaction & order
    await this.prisma.paymentTransaction.updateMany({
      where: { orderId: order.id },
      data: { status: 'SUCCESS' },
    });

    await this.prisma.order.update({
      where: { id: order.id },
      data: { status: 'PAID' },
    });

    // 4. Emit event
    await this.producer.emitPaymentCompleted({
      orderId: order.id,
      siteId: order.siteId,
      amount: Number(amount),
      gateway: 'payos',
    });

    return { success: true };
  }
}
