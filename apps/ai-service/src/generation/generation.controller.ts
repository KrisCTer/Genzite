import { Controller, Post, Body, Headers, HttpCode, HttpStatus } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { AI_QUEUES } from '../workers/queue.constants.js';
import { GenerateSiteDto } from './dto/generate-site.dto.js';
import { GenerateCmsDto } from './dto/generate-cms.dto.js';

@Controller('ai')
export class GenerationController {
  constructor(
    @InjectQueue(AI_QUEUES.SITE_GENERATION)
    private readonly siteQueue: Queue,
    @InjectQueue(AI_QUEUES.CMS_GENERATION)
    private readonly cmsQueue: Queue,
  ) {}

  @Post('generate-site')
  @HttpCode(HttpStatus.ACCEPTED)
  async generateSite(
    @Body() dto: GenerateSiteDto,
    @Headers('x-user-id') userId?: string,
  ) {
    const job = await this.siteQueue.add('generate', {
      prompt: dto.prompt,
      ownerId: userId ?? 'anonymous',
      model: dto.model,
    });

    return {
      message: 'Site generation job accepted',
      jobId: job.id,
    };
  }

  @Post('generate-cms')
  @HttpCode(HttpStatus.ACCEPTED)
  async generateCms(
    @Body() dto: GenerateCmsDto,
    @Headers('x-user-id') userId?: string,
  ) {
    const job = await this.cmsQueue.add('generate', {
      siteId: dto.siteId,
      prompt: dto.prompt,
      ownerId: userId ?? 'anonymous',
      model: dto.model,
    });

    return {
      message: 'CMS generation job accepted',
      jobId: job.id,
    };
  }
}
