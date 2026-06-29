import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { KafkaConsumerService } from '@genzite/kafka';
import { KAFKA_TOPICS, SiteGeneratedEvent } from '@genzite/shared-types';
import { SitesService } from '../sites/sites.service.js';
import { PagesService } from '../pages/pages.service.js';
import { WidgetsService } from '../widgets/widgets.service.js';

@Injectable()
export class AiConsumer implements OnModuleInit {
  private readonly logger = new Logger(AiConsumer.name);

  constructor(
    private readonly kafkaConsumer: KafkaConsumerService,
    private readonly sitesService: SitesService,
    private readonly pagesService: PagesService,
    private readonly widgetsService: WidgetsService,
  ) {}

  onModuleInit() {
    this.kafkaConsumer.subscribe<SiteGeneratedEvent['payload']>(
      KAFKA_TOPICS.SITE_GENERATED,
      async (event) => this.handleSiteGenerated(event.payload)
    );
  }

  private async handleSiteGenerated(payload: SiteGeneratedEvent['payload']) {
    this.logger.log(`Received SITE_GENERATED event for site subdomain ${payload.siteId}`);
    
    const { ownerId, siteData } = payload;
    if (!siteData) {
      this.logger.error('No siteData found in SITE_GENERATED event. Cannot create site.');
      return;
    }

    try {
      // 1. Create site
      const site = await this.sitesService.create({
        name: siteData.site.name,
        subdomain: siteData.site.subdomain,
      }, ownerId);

      this.logger.log(`Created Site ID: ${site.id} for subdomain ${site.subdomain}`);

      // 2. Iterate pages and create them
      for (const pageDef of siteData.pages) {
        const page = await this.pagesService.create(site.id, {
          title: pageDef.title,
          slug: pageDef.slug,
        }, ownerId);

        // 3. Create widgets for the page
        if (pageDef.widgets && pageDef.widgets.length > 0) {
          await this.widgetsService.replaceWidgets(
            page.id,
            pageDef.widgets,
            ownerId
          );
        }
      }

      // 4. E-COMMERCE HYBRID PAGE AUTO-GENERATION
      // Check if site has e-commerce widgets
      const isEcommerce = siteData.pages.some(p => 
        p.widgets.some(w => ['PRODUCT_GRID', 'CART', 'CHECKOUT'].includes(w.type.toUpperCase()))
      );

      if (isEcommerce) {
        this.logger.log(`E-commerce intent detected. Generating hybrid commerce pages for site: ${site.subdomain}`);
        
        // Auto-generate Admin Panel
        const adminPage = await this.pagesService.create(site.id, {
          title: 'Admin Dashboard',
          slug: 'admin',
        }, ownerId);
        
        await this.widgetsService.replaceWidgets(adminPage.id, [
          { type: 'ADMIN_PANEL', contentConfig: { heading: 'Dashboard Overview' }, sortOrder: 1 },
          { type: 'ORDER_TABLE', contentConfig: { heading: 'Recent Orders' }, sortOrder: 2 }
        ], ownerId);

        // Auto-generate Payment Status
        const paymentPage = await this.pagesService.create(site.id, {
          title: 'Payment Result',
          slug: 'payment-result',
        }, ownerId);

        await this.widgetsService.replaceWidgets(paymentPage.id, [
          { type: 'PAYMENT_STATUS', contentConfig: { heading: 'Payment Status' }, sortOrder: 1 }
        ], ownerId);
      }

      this.logger.log(`Successfully persisted fully generated site: ${site.subdomain}`);
    } catch (error) {
      this.logger.error(`Failed to persist generated site: ${error instanceof Error ? error.message : error}`);
    }
  }
}
