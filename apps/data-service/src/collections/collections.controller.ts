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
import { CollectionsService } from './collections.service.js';
import { CreateCollectionDto, UpdateCollectionDto } from './dto/create-collection.dto.js';

@Controller('cms/collections')
export class CollectionsController {
  constructor(private readonly collectionsService: CollectionsService) {}

  /** 4.4 — POST /api/v1/cms/collections */
  @Post()
  async create(
    @Body() dto: CreateCollectionDto,
    @Headers('x-user-id') userId: string,
  ) {
    if (!userId) {
      throw new BadRequestException('Header x-user-id is required');
    }
    return this.collectionsService.create(dto, userId);
  }

  /** 4.5 — GET /api/v1/cms/collections?siteId= */
  @Get()
  async findAll(@Query('siteId') siteId: string) {
    if (!siteId) {
      throw new BadRequestException('Query parameter siteId is required');
    }
    return this.collectionsService.findBySiteId(siteId);
  }

  /** 4.6 — GET /api/v1/cms/collections/:collectionId */
  @Get(':collectionId')
  async findOne(
    @Param('collectionId', ParseUUIDPipe) collectionId: string,
  ) {
    return this.collectionsService.findById(collectionId);
  }

  /** 4.7 — PUT /api/v1/cms/collections/:collectionId */
  @Put(':collectionId')
  async update(
    @Param('collectionId', ParseUUIDPipe) collectionId: string,
    @Body() dto: UpdateCollectionDto,
  ) {
    return this.collectionsService.update(collectionId, dto);
  }

  /** 4.8 — DELETE /api/v1/cms/collections/:collectionId */
  @Delete(':collectionId')
  async remove(
    @Param('collectionId', ParseUUIDPipe) collectionId: string,
  ) {
    return this.collectionsService.remove(collectionId);
  }
}
