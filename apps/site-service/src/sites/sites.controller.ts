import { Controller, Get, Post, Body, Param, Headers, Put, Delete } from '@nestjs/common';
import { SitesService } from './sites.service.js';

@Controller('sites')
export class SitesController {
  constructor(private readonly sitesService: SitesService) { }

  @Get()
  async findAll(
    @Headers('x-user-id') userId: string,
  ) {
    return this.sitesService.findAll(userId);
  }

  @Get('by-subdomain/:subdomain')
  async findBySubdomain(
    @Param('subdomain') subdomain: string,
    @Headers('x-user-id') userId: string,
  ) {
    return this.sitesService.findBySubdomainWithDetails(subdomain, userId);
  }

  @Get(':id')
  async findById(
    @Param('id') id: string,
    @Headers('x-user-id') userId: string,
  ) {
    return this.sitesService.findById(
      id,
      userId,
    );
  }

  @Post()
  async create(
    @Body() body: {
      name: string;
      subdomain: string;
      description?: string;
    },
    @Headers('x-user-id') userId: string
  ) {
    return this.sitesService.create(body, userId);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() body: {
      name?: string;
      subdomain?: string;
      settings?: any;
    },
    @Headers('x-user-id') userId: string,
  ) {
    return this.sitesService.update(
      id,
      body,
      userId,
    );
  }

  @Delete(':id')
  async delete(
    @Param('id') id: string,
    @Headers('x-user-id') userId: string,
  ) {
    return this.sitesService.delete(
      id,
      userId,
    );
  }

  // --- INTERNAL ENDPOINTS FOR MICROSERVICES ---
  // In production, secure this with an API Gateway Internal token or VPC
  @Get('internal/:id/config')
  async getInternalConfig(@Param('id') id: string) {
    return this.sitesService.getInternalConfig(id);
  }

  @Get('internal/:id/products')
  async getInternalProducts(@Param('id') id: string) {
    return this.sitesService.getInternalProducts(id);
  }
}
