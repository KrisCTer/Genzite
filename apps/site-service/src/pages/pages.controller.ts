import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { PagesService } from './pages.service.js';

@Controller('sites/:siteId/pages')
export class PagesController {
  constructor(private readonly pagesService: PagesService) {}

  @Get()
  async findAll(@Param('siteId') siteId: string) {
    return this.pagesService.findBySiteId(siteId);
  }

  @Post()
  async create(@Param('siteId') siteId: string, @Body() body: { title: string; slug: string }) {
    return this.pagesService.create(siteId, body);
  }
}
