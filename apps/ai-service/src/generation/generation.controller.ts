import { Controller, Post, Body } from '@nestjs/common';
import { SiteGeneratorService } from './site-generator.service.js';
import { CmsGeneratorService } from './cms-generator.service.js';

@Controller('ai')
export class GenerationController {
  constructor(
    private readonly siteGenerator: SiteGeneratorService,
    private readonly cmsGenerator: CmsGeneratorService,
  ) {}

  @Post('generate-site')
  async generateSite(@Body() body: { prompt: string }) {
    return this.siteGenerator.generate(body.prompt);
  }

  @Post('generate-cms')
  async generateCms(@Body() body: { siteId: string; prompt: string }) {
    return this.cmsGenerator.generate(body.siteId, body.prompt);
  }
}
