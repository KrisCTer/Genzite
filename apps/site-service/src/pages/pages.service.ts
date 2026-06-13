import { Injectable } from '@nestjs/common';

@Injectable()
export class PagesService {
  async findBySiteId(siteId: string) {
    // TODO: Query DB via Prisma
    return [];
  }

  async create(siteId: string, dto: { title: string; slug: string }) {
    // TODO: Save to DB via Prisma
    return { id: 'uuid', siteId, ...dto, sortOrder: 0, createdAt: new Date().toISOString() };
  }
}
