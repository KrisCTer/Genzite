import { Injectable } from '@nestjs/common';

@Injectable()
export class RegistryService {
  async findByOwnerId(ownerId: string) {
    // TODO: Query media metadata from DB via Prisma
    return [];
  }
}
