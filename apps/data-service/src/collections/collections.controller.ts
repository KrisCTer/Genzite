import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { CollectionsService } from './collections.service.js';

@Controller('cms/collections')
export class CollectionsController {
  constructor(private readonly collectionsService: CollectionsService) {}

  @Get()
  async findAll(@Query('siteId') siteId: string) {
    return this.collectionsService.findBySiteId(siteId);
  }

  @Post()
  async create(@Body() body: { siteId: string; name: string; schemaDefinition: Record<string, unknown> }) {
    return this.collectionsService.create(body);
  }
}
