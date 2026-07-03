import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { SiteProducer } from './site.producer.js';

@Injectable()
export class OutboxWorker implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(OutboxWorker.name);
  private timer: ReturnType<typeof setInterval> | null = null;
  private isProcessing = false;

  constructor(
    private readonly prisma: PrismaService,
    private readonly siteProducer: SiteProducer,
  ) {}

  onModuleInit() {
    this.logger.log('Initializing Outbox Event Worker...');
    // Poll every 5 seconds
    this.timer = setInterval(() => this.processOutboxEvents(), 5000);
  }

  onModuleDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  private async processOutboxEvents() {
    // Prevent overlapping execution if Kafka is slow
    if (this.isProcessing) return;
    
    this.isProcessing = true;
    try {
      const pendingEvents = await (this.prisma as any).outboxEvent.findMany({
        where: { status: 'PENDING' },
        take: 50,
        orderBy: { createdAt: 'asc' },
      });

      if (pendingEvents.length === 0) {
        this.isProcessing = false;
        return;
      }

      this.logger.debug(`Found ${pendingEvents.length} pending outbox events`);

      for (const event of pendingEvents) {
        try {
          // Route by event type
          if (event.eventType === 'WIDGET_CONFIG_CHANGED') {
            const payload = event.payload as any;
            await this.siteProducer.emitWidgetConfigChanged({
              pageId: payload.pageId,
              siteId: payload.siteId,
              widgetCount: payload.widgetCount,
            });
          }

          // If successful (no throw), mark as COMPLETED
          await (this.prisma as any).outboxEvent.update({
            where: { id: event.id },
            data: { status: 'COMPLETED' },
          });

          this.logger.debug(`Successfully processed event ${event.id}`);
        } catch (err: any) {
          // If Kafka fails, we log the error but leave the event as PENDING
          // It will be retried on the next polling cycle
          this.logger.error(`Failed to process event ${event.id}: ${err.message}`, err.stack);
        }
      }
    } catch (error: any) {
      this.logger.error('Error during outbox polling cycle', error.stack);
    } finally {
      this.isProcessing = false;
    }
  }
}
