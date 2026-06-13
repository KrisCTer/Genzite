import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersService {
  async findById(id: string) {
    // TODO: Query DB via Prisma
    return { id, email: 'user@example.com', name: 'User', roles: ['EDITOR'], avatarUrl: null };
  }
}
