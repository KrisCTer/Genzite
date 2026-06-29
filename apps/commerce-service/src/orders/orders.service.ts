import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CommerceProducer } from '../events/commerce.producer.js';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly producer: CommerceProducer,
  ) {}

  async createOrder(siteId: string, dto: any) {
    // Generate order number
    const orderNumber = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;

    // --- SECURITY PATCH: Server-Side Price Calculation ---
    // Fetch products from site-service
    const siteServiceUrl = process.env.SITE_SERVICE_URL || 'http://localhost:3002';
    const response = await fetch(`${siteServiceUrl}/sites/internal/${siteId}/products`);
    if (!response.ok) throw new Error('Failed to fetch site products');
    const availableProducts = await response.json();

    // Calculate subtotal
    let calculatedSubtotal = 0;
    const validatedItems = [];

    for (const item of dto.items) {
      const product = availableProducts.find((p: any) => p.id === item.id);
      if (!product) throw new Error(`Product ${item.id} not found on this site`);
      
      const price = Number(product.price);
      const qty = Number(item.quantity) || 1;
      calculatedSubtotal += price * qty;
      
      validatedItems.push({
        id: product.id,
        name: product.name,
        price: price,
        quantity: qty,
        image: product.image
      });
    }

    const calculatedTotal = calculatedSubtotal; // + shippingFee if any

    const order = await this.prisma.order.create({
      data: {
        siteId,
        orderNumber,
        customerName: dto.customerName,
        customerEmail: dto.customerEmail,
        shippingAddress: dto.shippingAddress,
        items: validatedItems,
        subtotal: calculatedSubtotal,
        total: calculatedTotal,
        paymentMethod: dto.paymentMethod || 'COD',
        status: 'PENDING',
      },
    });

    await this.producer.emitOrderCreated({
      orderId: order.id,
      siteId,
      total: Number(order.total),
      customerEmail: order.customerEmail,
    });

    return order;
  }

  async getOrders(siteId: string) {
    return this.prisma.order.findMany({
      where: { siteId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateOrderStatus(id: string, siteId: string, status: string) {
    const order = await this.prisma.order.findFirst({ where: { id, siteId } });
    if (!order) throw new NotFoundException('Order not found');

    return this.prisma.order.update({
      where: { id },
      data: { status },
    });
  }
}
