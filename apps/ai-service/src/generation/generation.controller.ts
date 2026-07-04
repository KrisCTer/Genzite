import { Controller, Post, Body, Headers, HttpCode, HttpStatus, Sse, Param, OnModuleInit, OnModuleDestroy, MessageEvent, Get, NotFoundException, Logger, ForbiddenException } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
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
    // Initialize QueueEvents with a dedicated connection to avoid blocking the main queue connection
    this.queueEvents = new QueueEvents(AI_QUEUES.SITE_GENERATION, {
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
      },
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
      siteId: dto.siteId,
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

  @SkipThrottle()
  @Get('site/job/:jobId')
  async getSiteJobStatus(
    @Param('jobId') jobId: string,
    @Headers('x-user-id') userId?: string,
  ) {
    const job = await this.siteQueue.getJob(jobId);
    if (!job) {
      throw new NotFoundException('Job not found');
    }
    // Ownership check: ensure requester owns this job
    if (userId && job.data?.ownerId && job.data.ownerId !== userId && job.data.ownerId !== 'anonymous') {
      throw new ForbiddenException('You do not own this job');
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

  @SkipThrottle()
  @Get('cms/job/:jobId')
  async getCmsJobStatus(
    @Param('jobId') jobId: string,
    @Headers('x-user-id') userId?: string,
  ) {
    const job = await this.cmsQueue.getJob(jobId);
    if (!job) {
      throw new NotFoundException('Job not found');
    }
    // Ownership check
    if (userId && job.data?.ownerId && job.data.ownerId !== userId && job.data.ownerId !== 'anonymous') {
      throw new ForbiddenException('You do not own this job');
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
          } catch(e: any) {
            Logger.error(`Failed to parse AI generation return value: ${e?.message || e}`, e?.stack, 'GenerationController');
            subscriber.next({ data: JSON.stringify({ step: 'System error', error: 'Invalid response from AI generation', done: true }) });
            subscriber.complete();
            return;
          }
          
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
