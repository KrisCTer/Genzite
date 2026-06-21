import { Controller, Post, Body, Headers } from '@nestjs/common';
import { SiteGeneratorService } from './site-generator.service.js';
import { CmsGeneratorService } from './cms-generator.service.js';
import { GenerateSiteDto } from './dto/generate-site.dto.js';
import { GenerateCmsDto } from './dto/generate-cms.dto.js';

@Controller('ai')
export class GenerationController {
  constructor(
    private readonly siteGenerator: SiteGeneratorService,
    private readonly cmsGenerator: CmsGeneratorService,
  ) {}

  @Post('generate-site')
  async generateSite(
    @Body() dto: GenerateSiteDto,
    @Headers('x-user-id') userId?: string,
  ) {
    return this.siteGenerator.generate(dto.prompt, userId, dto.model);
  }

  @Post('generate-cms')
  async generateCms(
    @Body() dto: GenerateCmsDto,
    @Headers('x-user-id') userId?: string,
  ) {
    return this.cmsGenerator.generate(dto.siteId, dto.prompt, userId, dto.model);
  }
}
