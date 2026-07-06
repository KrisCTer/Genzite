import { Injectable, UnauthorizedException, ConflictException, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { IdentityProducer } from '../events/identity.producer.js';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { createHash } from 'crypto';
import { MailService } from '../mail/mail.service.js';
import { ROLES } from '@genzite/shared-types';

@Injectable()
export class AuthService implements OnModuleInit {
  constructor(
    private readonly prisma: PrismaService,
    private readonly identityProducer: IdentityProducer,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  onModuleInit() {
    const ms = require('ms');
    const expiresInConfig = process.env.JWT_ACCESS_EXPIRES_IN || '15m';
    const parsed = ms(expiresInConfig);
    if (typeof parsed !== 'number' || isNaN(parsed)) {
      throw new Error(`CRITICAL STARTUP ERROR: Invalid format for JWT_ACCESS_EXPIRES_IN: "${expiresInConfig}". Must be a valid string like "15m", "1h", "7d", etc.`);
    }
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private async issueRefreshToken(userId: string, deviceInfo?: string): Promise<string> {
    const refreshSecret = process.env.JWT_REFRESH_SECRET;
    if (!refreshSecret) {
      throw new Error('JWT_REFRESH_SECRET is not configured');
    }

    const refreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
    const token = await this.jwtService.signAsync(
      { sub: userId, type: 'refresh' },
      { secret: refreshSecret, expiresIn: refreshExpiresIn as any },
    );

    const ms = require('ms');
    const expiresAt = new Date(Date.now() + ms(refreshExpiresIn));

    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash: this.hashToken(token),
        expiresAt,
        deviceInfo,
      },
    });

    return token;
  }

  private async issueTokenPair(user: { id: string; email: string; roles: string[] }) {
    const payload = { sub: user.id, email: user.email, roles: user.roles };
    const expiresInConfig = process.env.JWT_ACCESS_EXPIRES_IN || '15m';
    const accessToken = await this.jwtService.signAsync(payload, { expiresIn: expiresInConfig as any });
    const refreshToken = await this.issueRefreshToken(user.id);
    const ms = require('ms');
    const expiresInSeconds = Math.floor(ms(expiresInConfig) / 1000);

    return { accessToken, refreshToken, expiresIn: expiresInSeconds };
  }

  async register(dto: { email: string; password: string; name: string }) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(dto.password, salt);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        name: dto.name,
        roles: {
          create: {
            role: {
              connectOrCreate: {
                where: { name: ROLES.VIEWER },
                create: { name: ROLES.VIEWER, description: 'Standard viewer role' },
              },
            },
          },
        },
      },
    });

    this.identityProducer.emitUserRegistered({
      userId: user.id,
      email: user.email,
      name: user.name || '',
    });

    return {
      id: user.id,
      email: user.email,
      name: user.name,
    };
  }

  async login(dto: { email: string; password: string }) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: {
        roles: {
          include: { role: true },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException({
        errorCode: 'AUTH_INVALID_CREDENTIALS',
        message: 'Tài khoản hoặc mật khẩu không chính xác.',
      });
    }

    if (user.status === 'LOCKED' || (user.lockedUntil && user.lockedUntil > new Date())) {
      throw new UnauthorizedException({
        errorCode: 'AUTH_ACCOUNT_LOCKED',
        message: 'Tài khoản đã bị khóa do đăng nhập sai quá nhiều lần. Vui lòng thử lại sau.',
      });
    }

    if (user.status === 'INACTIVE') {
      throw new UnauthorizedException({
        errorCode: 'AUTH_ACCOUNT_INACTIVE',
        message: 'Tài khoản đã bị vô hiệu hóa.',
      });
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      const attempts = user.failedLoginAttempts + 1;
      const isLocked = attempts >= 5;

      await this.prisma.$transaction([
        this.prisma.user.update({
          where: { id: user.id },
          data: {
            failedLoginAttempts: attempts,
            status: isLocked ? 'LOCKED' : user.status,
            lockedUntil: isLocked ? new Date(Date.now() + 15 * 60 * 1000) : null,
          },
        }),
        this.prisma.auditLog.create({
          data: {
            userId: user.id,
            action: 'LOGIN_FAILED',
            details: { attempts, isLocked },
          },
        }),
      ]);

      throw new UnauthorizedException({
        errorCode: 'AUTH_INVALID_CREDENTIALS',
        message: 'Tài khoản hoặc mật khẩu không chính xác.',
      });
    }

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: 0,
          lockedUntil: null,
          status: 'ACTIVE',
          lastLoginAt: new Date(),
        },
      }),
      this.prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'LOGIN_SUCCESS',
        },
      }),
    ]);

    const roleNames = user.roles.map((ur) => ur.role.name.toUpperCase());
    const tokens = await this.issueTokenPair({ id: user.id, email: user.email, roles: roleNames });

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        name: user.name || '',
        roles: roleNames,
        avatarUrl: user.avatarUrl || null,
        status: user.status,
        createdAt: user.createdAt.toISOString(),
      },
    };
  }

  async logout(userId: string, refreshToken?: string) {
    if (refreshToken) {
      await this.prisma.refreshToken.updateMany({
        where: { userId, tokenHash: this.hashToken(refreshToken), isRevoked: false },
        data: { isRevoked: true },
      });
    } else {
      await this.prisma.refreshToken.updateMany({
        where: { userId, isRevoked: false },
        data: { isRevoked: true },
      });
    }

    await this.prisma.auditLog.create({
      data: {
        userId,
        action: 'LOGOUT',
      },
    });
    return { message: 'Logged out successfully' };
  }

  async changePassword(userId: string, dto: any) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException({
      errorCode: 'AUTH_USER_NOT_FOUND',
      message: 'Người dùng không tồn tại.',
    });

    const isPasswordValid = await bcrypt.compare(dto.oldPassword, user.passwordHash);
    if (!isPasswordValid) throw new UnauthorizedException({
      errorCode: 'AUTH_INVALID_OLD_PASSWORD',
      message: 'Mật khẩu cũ không chính xác.',
    });

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(dto.newPassword, salt);

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: userId },
        data: { passwordHash },
      }),
      this.prisma.refreshToken.updateMany({
        where: { userId, isRevoked: false },
        data: { isRevoked: true },
      }),
      this.prisma.auditLog.create({
        data: { userId, action: 'PASSWORD_CHANGED' },
      }),
    ]);

    return { message: 'Password changed successfully' };
  }

  async refresh(refreshToken: string) {
    const refreshSecret = process.env.JWT_REFRESH_SECRET;
    if (!refreshSecret) {
      throw new UnauthorizedException('Refresh token is not configured');
    }

    let payload: { sub: string; type?: string };
    try {
      payload = this.jwtService.verify(refreshToken, { secret: refreshSecret }) as { sub: string; type?: string };
    } catch {
      throw new UnauthorizedException({
        errorCode: 'AUTH_INVALID_REFRESH_TOKEN',
        message: 'Refresh token không hợp lệ hoặc đã hết hạn.',
      });
    }

    if (payload.type !== 'refresh') {
      throw new UnauthorizedException({
        errorCode: 'AUTH_INVALID_REFRESH_TOKEN',
        message: 'Refresh token không hợp lệ.',
      });
    }

    const tokenHash = this.hashToken(refreshToken);
    const stored = await this.prisma.refreshToken.findUnique({ where: { tokenHash } });

    if (!stored || stored.isRevoked || stored.expiresAt < new Date()) {
      throw new UnauthorizedException({
        errorCode: 'AUTH_INVALID_REFRESH_TOKEN',
        message: 'Refresh token không hợp lệ hoặc đã bị thu hồi.',
      });
    }

    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { isRevoked: true },
    });

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: { roles: { include: { role: true } } },
    });

    if (!user || user.status !== 'ACTIVE') {
      throw new UnauthorizedException({
        errorCode: 'AUTH_ACCOUNT_INACTIVE',
        message: 'Tài khoản không khả dụng.',
      });
    }

    const roleNames = user.roles.map((ur) => ur.role.name.toUpperCase());
    return this.issueTokenPair({ id: user.id, email: user.email, roles: roleNames });
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return { message: 'If email exists, a reset link has been sent.' };

    const resetToken = this.jwtService.sign(
      { sub: user.id, email: user.email, purpose: 'reset-password' },
      { expiresIn: '15m' },
    );

    await this.mailService.sendPasswordResetEmail(user.email, resetToken);

    await this.prisma.auditLog.create({
      data: { userId: user.id, action: 'FORGOT_PASSWORD_REQUESTED' },
    });

    return {
      message: 'If email exists, a reset link has been sent.',
    };
  }

  async resetPassword(token: string, newPassword: string) {
    let payload: { sub: string; purpose?: string };
    try {
      payload = this.jwtService.verify(token) as { sub: string; purpose?: string };
    } catch {
      throw new UnauthorizedException('Invalid or expired reset token');
    }

    if (payload.purpose !== 'reset-password') {
      throw new UnauthorizedException('Invalid token purpose');
    }

    const userId = payload.sub;
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: userId },
        data: { passwordHash },
      }),
      this.prisma.refreshToken.updateMany({
        where: { userId, isRevoked: false },
        data: { isRevoked: true },
      }),
      this.prisma.auditLog.create({
        data: { userId, action: 'PASSWORD_RESET_SUCCESS' },
      }),
    ]);

    return { message: 'Password reset successfully' };
  }
}
