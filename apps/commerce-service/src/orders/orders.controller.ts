import { Controller, Get, Post, Put, Body, Param, Headers } from '@nestjs/common';
import { OrdersService } from './orders.service.js';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  async createOrder(
    @Headers('x-site-id') siteId: string,
    @Body() dto: any,
  ) {
    return this.ordersService.createOrder(siteId, dto);
  }

  @Get()
  async getOrders(@Headers('x-site-id') siteId: string) {
    return this.ordersService.getOrders(siteId);
  }

  @Put(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Headers('x-site-id') siteId: string,
    @Body('status') status: string,
  ) {
    return this.ordersService.updateOrderStatus(id, siteId, status);
  }
}
