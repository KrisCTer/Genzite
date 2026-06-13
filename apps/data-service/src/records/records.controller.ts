import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { RecordsService } from './records.service.js';

@Controller('cms/collections/:collectionId/records')
export class RecordsController {
  constructor(private readonly recordsService: RecordsService) {}

  @Get()
  async findAll(@Param('collectionId') collectionId: string, @Query('page') page?: number, @Query('limit') limit?: number) {
    return this.recordsService.findByCollectionId(collectionId, page, limit);
  }

  @Post()
  async create(@Param('collectionId') collectionId: string, @Body() body: { data: Record<string, unknown> }) {
    return this.recordsService.create(collectionId, body.data);
  }

  @Put(':recordId')
  async update(@Param('recordId') recordId: string, @Body() body: { data: Record<string, unknown> }) {
    return this.recordsService.update(recordId, body.data);
  }

  @Delete(':recordId')
  async remove(@Param('recordId') recordId: string) {
    return this.recordsService.remove(recordId);
  }
}
