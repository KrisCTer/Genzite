import { Injectable } from '@nestjs/common';

@Injectable()
export class SitesService {
  async findAll() {
    // TODO: Query DB via Prisma
    return [];
  }

  async findById(id: string) {
    // TODO: Query DB via Prisma
    return { id, name: 'My Site', subdomain: 'mysite', settings: {}, createdAt: new Date().toISOString() };
  }

  async create(dto: { name: string; subdomain: string; description?: string }) {
    // TODO: Save to DB via Prisma
    return { id: 'uuid', ...dto, createdAt: new Date().toISOString() };
  }
}
