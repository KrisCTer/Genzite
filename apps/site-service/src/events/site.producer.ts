import { Injectable } from '@nestjs/common';

@Injectable()
export class SiteProducer {
  async emitSiteCreated(payload: { siteId: string; name: string; subdomain: string; ownerId: string }) {
    // TODO: Publish to Kafka topic 'site.created'
    console.log('[Site] Event emitted: site.created', payload);
  }

  async emitPageUpdated(payload: { pageId: string; siteId: string; title: string }) {
    // TODO: Publish to Kafka topic 'page.updated'
    console.log('[Site] Event emitted: page.updated', payload);
  }
}
