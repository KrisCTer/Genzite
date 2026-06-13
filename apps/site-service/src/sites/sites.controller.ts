import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { SitesService } from './sites.service.js';

@Controller('sites')
export class SitesController {
  constructor(private readonly sitesService: SitesService) {}

  @Get()
  async findAll() {
    return this.sitesService.findAll();
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.sitesService.findById(id);
  }

  @Post()
  async create(@Body() body: { name: string; subdomain: string; description?: string }) {
    return this.sitesService.create(body);
  }
}
