import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

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
      credits: user.credits,
      roles: roleNames,
      avatarUrl: user.avatarUrl,
    };
  }

  // --- INTERNAL METHODS ---
  async deductCredits(id: string, amount: number) {
    // SECURITY PATCH: Atomic decrement to prevent Race Condition (negative credits)
    const result = await this.prisma.user.updateMany({
      where: { 
        id, 
        credits: { gte: amount } 
      },
      data: {
        credits: {
          decrement: amount
        }
      }
    });

    if (result.count === 0) {
      throw new BadRequestException('Insufficient credits or user not found');
    }

    return { success: true, deducted: amount };
  }
}
