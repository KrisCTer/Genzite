import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Headers,
  ParseUUIDPipe,
  BadRequestException,
} from '@nestjs/common';
import { RecordsService } from './records.service.js';
import { CreateRecordDto, UpdateRecordDto } from './dto/record.dto.js';

@Controller()
export class RecordsController {
  constructor(private readonly recordsService: RecordsService) {}

  /** 4.9 — POST /api/v1/cms/collections/:collectionId/records */
  @Post('cms/collections/:collectionId/records')
  async create(
    @Param('collectionId', ParseUUIDPipe) collectionId: string,
    @Body() dto: CreateRecordDto,
    @Headers('x-user-id') userId: string,
  ) {
    if (!userId) {
      throw new BadRequestException('Header x-user-id is required');
    }
    return this.recordsService.create(collectionId, dto.data, userId);
  }

  /** 4.15 — GET /api/v1/cms/collections/:collectionId/records/search (Advanced JSONB filter) */
  @Get('cms/collections/:collectionId/records/search')
  async search(
    @Param('collectionId', ParseUUIDPipe) collectionId: string,
    @Query() query: Record<string, string>,
  ) {
    return this.recordsService.searchByFilters(collectionId, query);
  }

  /** 4.10 — GET /api/v1/cms/collections/:collectionId/records */
  @Get('cms/collections/:collectionId/records')
  async findAll(
    @Param('collectionId', ParseUUIDPipe) collectionId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('sort') sort?: string,
    @Query('order') order?: string,
  ) {
    return this.recordsService.findByCollectionId(collectionId, {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      sort,
      order: order as 'asc' | 'desc' | undefined,
    });
  }

  /** 4.11 — GET /api/v1/cms/records/:recordId */
  @Get('cms/records/:recordId')
  async findOne(
    @Param('recordId', ParseUUIDPipe) recordId: string,
  ) {
    return this.recordsService.findById(recordId);
  }

  /** 4.12 — PUT /api/v1/cms/records/:recordId */
  @Put('cms/records/:recordId')
  async update(
    @Param('recordId', ParseUUIDPipe) recordId: string,
    @Body() dto: UpdateRecordDto,
    @Headers('x-user-id') userId: string,
  ) {
    if (!userId) {
      throw new BadRequestException('Header x-user-id is required');
    }
    return this.recordsService.update(recordId, dto.data, userId);
  }

  /** 4.13 — DELETE /api/v1/cms/records/:recordId */
  @Delete('cms/records/:recordId')
  async remove(
    @Param('recordId', ParseUUIDPipe) recordId: string,
  ) {
    return this.recordsService.remove(recordId);
  }
}
