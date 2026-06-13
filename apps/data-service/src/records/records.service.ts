import { Injectable } from '@nestjs/common';

@Injectable()
export class RecordsService {
  async findByCollectionId(collectionId: string, page?: number, limit?: number) {
    // TODO: Query DB via Prisma with pagination
    return { data: [], total: 0, page: page ?? 1, limit: limit ?? 20, totalPages: 0 };
  }

  async create(collectionId: string, data: Record<string, unknown>) {
    // TODO: Save JSONB data to DB via Prisma
    return { id: 'uuid', collectionId, data, createdAt: new Date().toISOString() };
  }

  async update(recordId: string, data: Record<string, unknown>) {
    // TODO: Update JSONB data via Prisma
    return { id: recordId, data, updatedAt: new Date().toISOString() };
  }

  async remove(recordId: string) {
    // TODO: Delete via Prisma
    return { deleted: true, id: recordId };
  }
}
