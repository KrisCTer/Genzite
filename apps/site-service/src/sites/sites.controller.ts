import { Controller, Get, Post, Body, Param, Headers, Put, Delete, ForbiddenException, Query } from '@nestjs/common';
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

  @Get('check-subdomain')
  async checkSubdomainAvailability(
    @Query('subdomain') subdomain: string,
    @Query('excludeSiteId') excludeSiteId?: string,
  ) {
    return this.sitesService.checkSubdomainAvailability(subdomain, excludeSiteId);
  }

  @Get('by-subdomain/:subdomain')
  async findBySubdomain(
    @Param('subdomain') subdomain: string,
    @Headers('x-user-id') userId: string,
    @Headers('x-user-email') userEmail: string,
  ) {
    return this.sitesService.findBySubdomainWithDetails(subdomain, userId, userEmail);
  }

  @Get(':id')
  async findById(
    @Param('id') id: string,
    @Headers('x-user-id') userId: string,
    @Headers('x-user-email') userEmail: string,
  ) {
    return this.sitesService.findById(
      id,
      userId,
      userEmail,
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

  @Post(':id/duplicate')
  async duplicate(
    @Param('id') id: string,
    @Headers('x-user-id') userId: string,
  ) {
    return this.sitesService.duplicate(id, userId);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() body: {
      name?: string;
      subdomain?: string;
      description?: string;
      isPublished?: boolean;
      settings?: any;
    },
    @Headers('x-user-id') userId: string,
    @Headers('x-user-email') userEmail: string,
  ) {
    return this.sitesService.update(
      id,
      body,
      userId,
      userEmail,
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

  @Post('feedback')
  async submitFeedback(
    @Body() body: { siteId?: string; text: string },
    @Headers('x-user-email') userEmail: string,
  ) {
    if (!userEmail) {
      throw new Error("Missing user email");
    }
    await this.sitesService.submitFeedback(body, userEmail);
    return { success: true };
  }

  @Get('trash/list')
  async findTrash(
    @Headers('x-user-id') userId: string,
  ) {
    return this.sitesService.findTrash(userId);
  }

  @Post(':id/restore')
  async restore(
    @Param('id') id: string,
    @Headers('x-user-id') userId: string,
  ) {
    return this.sitesService.restore(
      id,
      userId,
    );
  }

  // --- INTERNAL ENDPOINTS FOR MICROSERVICES ---
  // In production, secure this with an API Gateway Internal token or VPC
  @Get('internal/:id/config')
  async getInternalConfig(
    @Param('id') id: string,
    @Headers('x-internal-token') internalToken: string
  ) {
    if (internalToken !== (process.env.INTERNAL_SERVICE_TOKEN || 'dev-internal-token')) {
      throw new ForbiddenException('Invalid internal service token');
    }
    return this.sitesService.getInternalConfig(id);
  }

  @Get('internal/:id/products')
  async getInternalProducts(
    @Param('id') id: string,
    @Headers('x-internal-token') internalToken: string
  ) {
    if (internalToken !== (process.env.INTERNAL_SERVICE_TOKEN || 'dev-internal-token')) {
      throw new ForbiddenException('Invalid internal service token');
    }
    return this.sitesService.getInternalProducts(id);
  }
}
