import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { IdentityProducer } from '../events/identity.producer.js';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly identityProducer: IdentityProducer
  ) { }

  async findOrCreateUser(id: string, email: string, name: string) {
    let user = await this.prisma.user.findUnique({
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
      // Check if user already exists by email (e.g. created locally before Cognito)
      const existingUser = await this.prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        // Update user ID to match Cognito sub via raw SQL (triggers ON UPDATE CASCADE for relations)
        await this.prisma.$executeRawUnsafe(
          `UPDATE "identity"."users" SET "id" = $1 WHERE "id" = $2`,
          id,
          existingUser.id,
        );

        // Re-fetch the user record with the new ID
        user = await this.prisma.user.findUnique({
          where: { id },
          include: {
            roles: {
              include: {
                role: true,
              },
            },
          },
        });
      }
    }

    if (!user) {
      // Provision default role
      const adminRole = await this.prisma.role.findFirst({
        where: { name: 'ADMIN' },
      });
      const userRole = await this.prisma.role.findFirst({
        where: { name: 'USER' },
      });
      const roleToAssign = adminRole || userRole;

      user = await this.prisma.user.create({
        data: {
          id,
          email,
          name,
          passwordHash: '', // Cognito user - no local password
          roles: roleToAssign
            ? {
              create: {
                roleId: roleToAssign.id,
              },
            }
            : undefined,
        },
        include: {
          roles: {
            include: {
              role: true,
            },
          },
        },
      });

      try {
        await this.identityProducer.emitUserRegistered({
          userId: user.id,
          email: user.email,
          name: user.name ?? '',
        });
      } catch (eventErr) {
        console.warn('Could not emit user registered event', eventErr);
      }
    }

    const roleNames = user.roles.map((ur) => ur.role.name.toUpperCase());

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
    const roleNames = user.roles.map((ur) => ur.role.name.toUpperCase());

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

    if (dto.avatarUrl !== undefined && user.avatarUrl && dto.avatarUrl !== user.avatarUrl) {
      // Extract S3 Key from absolute URL to identify the file in S3
      const match = user.avatarUrl.match(/amazonaws\.com\/(uploads\/.*)/);
      if (match && match[1]) {
        const oldS3Key = match[1];
        const mediaServiceUrl = process.env.MEDIA_SERVICE_URL || 'http://localhost:3004';

        // Native Node.js fetch call (non-blocking)
        fetch(`${mediaServiceUrl}/api/v1/media/internal/delete-by-key`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-internal-token': process.env.INTERNAL_SERVICE_TOKEN || '',
          },
          body: JSON.stringify({ s3Key: oldS3Key }),
        }).catch((err) => {
          console.warn('Failed to request old avatar S3 deletion', err);
        });
      }
    }

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
        credits: true,
        createdAt: true,
        avatarUrl: true,
        metadata: true,
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
  async updateRoles(id: string, roleNames: string[], adminId?: string) {
    if (!roleNames || roleNames.length === 0) {
      throw new BadRequestException('User must have at least one role');
    }

    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    await this.prisma.$transaction([
      this.prisma.userRole.deleteMany({ where: { userId: id } }),
      ...roleNames.map(roleName =>
        this.prisma.userRole.create({
          data: {
            user: { connect: { id } },
            role: {
              connectOrCreate: {
                where: { name: roleName },
                create: { name: roleName, description: 'Created via admin role update' }
              }
            }
          }
        })
      ),
      this.prisma.auditLog.create({
        data: { userId: id, action: 'ROLES_UPDATED_BY_ADMIN', details: { roles: roleNames } }
      })
    ]);

    await this.identityProducer.emitRoleAssigned({
      userId: id,
      roleName: roleNames.join(', '),
      adminId,
    });

    return { message: 'Roles updated successfully', roles: roleNames };
  }
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

  async adjustCredits(id: string, amount: number, adminId: string) {
    if (!amount || amount === 0) {
      throw new BadRequestException('Amount must be a non-zero integer');
    }

    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    if (amount > 0) {
      await this.refundCredits(id, amount);
    } else {
      await this.deductCredits(id, Math.abs(amount));
    }

    const updated = await this.prisma.user.findUnique({
      where: { id },
      select: { credits: true },
    });

    await this.prisma.auditLog.create({
      data: {
        userId: id,
        action: 'CREDITS_ADJUSTED_BY_ADMIN',
        details: { amount, adminId, newBalance: updated?.credits },
      },
    });

    if (updated) {
      await this.identityProducer.emitCreditsAdjusted({
        userId: id,
        adminId,
        amount,
        newBalance: updated.credits,
      });
    }

    return { success: true, adjusted: amount, credits: updated?.credits ?? 0 };
  }
}
