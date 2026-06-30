import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) { }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Map roles to a flat array of role names
    const roleNames = user.roles.map((ur) => ur.role.name);

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      roles: roleNames,
      avatarUrl: user.avatarUrl,
    };
  }
}