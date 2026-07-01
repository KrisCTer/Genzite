import { Controller, Post, Body, Headers, HttpCode, HttpStatus, Sse, Param, OnModuleInit, OnModuleDestroy, MessageEvent, Get, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue, QueueEvents } from 'bullmq';
import { Observable } from 'rxjs';
import { AI_QUEUES } from '../workers/queue.constants.js';
import { GenerateSiteDto } from './dto/generate-site.dto.js';
import { GenerateCmsDto } from './dto/generate-cms.dto.js';

@Controller('ai')
export class GenerationController implements OnModuleInit, OnModuleDestroy {
  private queueEvents!: QueueEvents;

  constructor(
    @InjectQueue(AI_QUEUES.SITE_GENERATION)
    private readonly siteQueue: Queue,
    @InjectQueue(AI_QUEUES.CMS_GENERATION)
    private readonly cmsQueue: Queue,
  ) {}

  async onModuleInit() {
    // Initialize QueueEvents to listen to Redis events, sharing the connection with siteQueue
    const redisOptions = await this.siteQueue.opts.connection;
    this.queueEvents = new QueueEvents(AI_QUEUES.SITE_GENERATION, {
      connection: redisOptions,
    });
  }

  async onModuleDestroy() {
    await this.queueEvents.close();
  }

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

  @Get('site/job/:jobId')
  async getSiteJobStatus(@Param('jobId') jobId: string) {
    const job = await this.siteQueue.getJob(jobId);
    if (!job) {
      throw new NotFoundException('Job not found');
    }
    const state = await job.getState();
    return {
      id: job.id,
      state,
      progress: job.progress,
      failedReason: job.failedReason,
      output: job.returnvalue,
    };
  }

  @Get('cms/job/:jobId')
  async getCmsJobStatus(@Param('jobId') jobId: string) {
    const job = await this.cmsQueue.getJob(jobId);
    if (!job) {
      throw new NotFoundException('Job not found');
    }
    const state = await job.getState();
    return {
      id: job.id,
      state,
      progress: job.progress,
      failedReason: job.failedReason,
      output: job.returnvalue,
    };
  }

  @Sse('stream/:jobId')
  streamStatus(@Param('jobId') jobId: string): Observable<MessageEvent> {
    return new Observable((subscriber) => {
      // 1. Listen for progress
      const onProgress = ({ jobId: eventJobId, data }: any) => {
        if (eventJobId === jobId) {
          subscriber.next({ data: JSON.stringify(data) });
        }
      };

      // 2. Listen for completion
      const onCompleted = ({ jobId: eventJobId, returnvalue }: any) => {
        if (eventJobId === jobId) {
          let subdomain;
          try {
            if (typeof returnvalue === 'string') {
               subdomain = JSON.parse(returnvalue)?.site?.subdomain;
            } else if (returnvalue) {
               subdomain = returnvalue?.site?.subdomain;
            }
          } catch(e) {}
          
          subscriber.next({ data: JSON.stringify({ step: 'Completed!', percent: 100, done: true, subdomain }) });
          subscriber.complete();
        }
      };

      // 3. Listen for failure
      const onFailed = ({ jobId: eventJobId, failedReason }: any) => {
        if (eventJobId === jobId) {
          subscriber.next({ data: JSON.stringify({ step: 'System error', error: failedReason, done: true }) });
          subscriber.complete();
        }
      };

      // Register events
      this.queueEvents.on('progress', onProgress);
      this.queueEvents.on('completed', onCompleted);
      this.queueEvents.on('failed', onFailed);

      // Cleanup when Client closes connection or Observable completes
      return () => {
        this.queueEvents.off('progress', onProgress);
        this.queueEvents.off('completed', onCompleted);
        this.queueEvents.off('failed', onFailed);
      };
    });
  }
}
