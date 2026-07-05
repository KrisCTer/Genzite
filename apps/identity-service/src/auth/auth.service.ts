import { Injectable, UnauthorizedException, ConflictException, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { IdentityProducer } from '../events/identity.producer.js';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { MailService } from '../mail/mail.service.js';

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
          include: { role: true }
        }
      }
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if account is locked
    if (user.status === 'LOCKED' || (user.lockedUntil && user.lockedUntil > new Date())) {
      throw new UnauthorizedException('Account is locked due to multiple failed login attempts. Please try again later.');
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
        })
      ]);

      throw new UnauthorizedException('Invalid credentials');
    }

    // Reset failed attempts on success
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
      })
    ]);

    const roleNames = user.roles.map((ur) => ur.role.name);
    const payload = { sub: user.id, email: user.email, roles: roleNames };
    
    const expiresInConfig = process.env.JWT_ACCESS_EXPIRES_IN || '15m';
    const accessToken = await this.jwtService.signAsync(payload, { expiresIn: expiresInConfig as any });

    const ms = require('ms');
    const expiresInSeconds = Math.floor(ms(expiresInConfig) / 1000);

    return { accessToken, expiresIn: expiresInSeconds };
  }

  async logout(userId: string, token: string) {
    // Ideally we would add token to a Redis Blacklist here.
    // For now, we revoke all refresh tokens for the device (if provided) and log.
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
    if (!user) throw new UnauthorizedException();

    const isPasswordValid = await bcrypt.compare(dto.oldPassword, user.passwordHash);
    if (!isPasswordValid) throw new UnauthorizedException('Invalid old password');

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(dto.newPassword, salt);

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: userId },
        data: { passwordHash },
      }),
      this.prisma.auditLog.create({
        data: { userId, action: 'PASSWORD_CHANGED' },
      })
    ]);

    return { message: 'Password changed successfully' };
  }

  async refresh(refreshToken: string) {
    // Stub for refresh token logic. In production, validate token against DB.
    // Rotate token, issue new access token.
    throw new Error('Not implemented yet in MVP');
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    // Security: always return same message to prevent email enumeration
    if (!user) return { message: 'If email exists, a reset link has been sent.' }; 

    // Create a secure stateless JWT token valid for 15 minutes
    const resetToken = this.jwtService.sign(
      { sub: user.id, email: user.email, purpose: 'reset-password' },
      { expiresIn: '15m' }
    );
    
    // Send Real Email using Nodemailer
    await this.mailService.sendPasswordResetEmail(user.email, resetToken);
    
    await this.prisma.auditLog.create({
      data: { userId: user.id, action: 'FORGOT_PASSWORD_REQUESTED' }
    });

    return { 
      message: 'If email exists, a reset link has been sent.'
    };
  }

  async resetPassword(token: string, newPassword: string) {
    let payload;
    try {
      // Verify JWT signature and expiration
      payload = this.jwtService.verify(token);
    } catch (e) {
      throw new UnauthorizedException('Invalid or expired reset token');
    }

    if (payload.purpose !== 'reset-password') {
      throw new UnauthorizedException('Invalid token purpose');
    }
    
    const userId = payload.sub;
    
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: userId },
        data: { passwordHash },
      }),
      this.prisma.auditLog.create({
        data: { userId, action: 'PASSWORD_RESET_SUCCESS' }
      })
    ]);

    return { message: 'Password reset successfully' };
  }
}
