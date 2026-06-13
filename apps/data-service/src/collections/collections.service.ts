import { Injectable } from '@nestjs/common';

@Injectable()
export class CollectionsService {
  async findBySiteId(siteId: string) {
    // TODO: Query DB via Prisma
    return [];
  }

  async create(dto: { siteId: string; name: string; schemaDefinition: Record<string, unknown> }) {
    // TODO: Save to DB via Prisma, all dynamic data in JSONB
    return { id: 'uuid', ...dto, createdAt: new Date().toISOString() };
  }
}
