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
      metadata: user.metadata,
      status: user.status,
    };
  }

  async updateProfile(id: string, dto: { name?: string; avatarUrl?: string; metadata?: any }) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: {
        name: dto.name !== undefined ? dto.name : undefined,
        avatarUrl: dto.avatarUrl !== undefined ? dto.avatarUrl : undefined,
        metadata: dto.metadata !== undefined ? dto.metadata : undefined,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        userId: id,
        action: 'PROFILE_UPDATED',
        details: { oldMetadata: user.metadata, newMetadata: updatedUser.metadata }
      }
    });

    return {
      id: updatedUser.id,
      name: updatedUser.name,
      avatarUrl: updatedUser.avatarUrl,
      metadata: updatedUser.metadata,
    };
  }

  async findAll() {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        status: true,
        createdAt: true,
        roles: { include: { role: true } }
      },
      take: 50 // simple pagination for MVP
    });
    return users.map(u => ({
      ...u,
      roles: u.roles.map(ur => ur.role.name)
    }));
  }

  // --- ADMIN ACTIONS ---
  async lockAccount(id: string) {
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id },
        data: { status: 'LOCKED', lockedUntil: new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000) }
      }),
      this.prisma.auditLog.create({
        data: { userId: id, action: 'ACCOUNT_LOCKED_BY_ADMIN' }
      })
    ]);
    return { message: 'Account locked successfully' };
  }

  async unlockAccount(id: string) {
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id },
        data: { status: 'ACTIVE', lockedUntil: null, failedLoginAttempts: 0 }
      }),
      this.prisma.auditLog.create({
        data: { userId: id, action: 'ACCOUNT_UNLOCKED_BY_ADMIN' }
      })
    ]);
    return { message: 'Account unlocked successfully' };
  }

  async deactivateAccount(id: string) {
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id },
        data: { status: 'INACTIVE' }
      }),
      this.prisma.auditLog.create({
        data: { userId: id, action: 'ACCOUNT_DEACTIVATED_BY_ADMIN' }
      })
    ]);
    return { message: 'Account deactivated successfully' };
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

  async refundCredits(id: string, amount: number) {
    await this.prisma.user.update({
      where: { id },
      data: { credits: { increment: amount } },
    });
    return { success: true, refunded: amount };
  }
}
