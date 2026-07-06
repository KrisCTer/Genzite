import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { IdentityProducer } from '../events/identity.producer';
import { JwtService } from '@nestjs/jwt';
import { MailService } from '../mail/mail.service';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

jest.mock('bcryptjs', () => ({
  genSalt: jest.fn().mockResolvedValue('mock-salt'),
  hash: jest.fn().mockResolvedValue('mock-hash'),
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let identityProducer: IdentityProducer;
  let jwtService: JwtService;

  beforeEach(async () => {
    process.env.JWT_ACCESS_EXPIRES_IN = '15m';
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-min-32-characters-long';
    process.env.JWT_REFRESH_EXPIRES_IN = '7d';

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
            },
            auditLog: {
              create: jest.fn(),
            },
            refreshToken: {
              create: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
              updateMany: jest.fn(),
            },
            $transaction: jest.fn((ops: Promise<unknown>[]) => Promise.all(ops)),
          },
        },
        {
          provide: IdentityProducer,
          useValue: {
            emitUserRegistered: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
            verify: jest.fn(),
            sign: jest.fn(),
          },
        },
        {
          provide: MailService,
          useValue: {
            sendPasswordResetEmail: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    identityProducer = module.get<IdentityProducer>(IdentityProducer);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    const dto = { email: 'test@test.com', password: 'password123', name: 'Test User' };

    it('should register a new user successfully', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);
      const createdUser = { id: 'uuid-123', ...dto, passwordHash: 'mock-hash' };
      jest.spyOn(prisma.user, 'create').mockResolvedValue(createdUser as any);

      const result = await service.register(dto);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: dto.email } });
      expect(bcrypt.hash).toHaveBeenCalledWith(dto.password, 'mock-salt');
      expect(prisma.user.create).toHaveBeenCalled();
      expect(identityProducer.emitUserRegistered).toHaveBeenCalledWith({
        userId: createdUser.id,
        email: createdUser.email,
        name: createdUser.name,
      });
      expect(result).toEqual({ id: createdUser.id, email: createdUser.email, name: createdUser.name });
    });

    it('should throw ConflictException if user already exists', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue({ id: 'existing' } as any);

      await expect(service.register(dto)).rejects.toThrow(ConflictException);
      expect(prisma.user.create).not.toHaveBeenCalled();
      expect(identityProducer.emitUserRegistered).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    const dto = { email: 'test@test.com', password: 'password123' };

    it('should login successfully and return tokens', async () => {
      const user = {
        id: 'uuid-123',
        email: dto.email,
        passwordHash: 'mock-hash',
        status: 'ACTIVE',
        failedLoginAttempts: 0,
        lockedUntil: null,
        name: 'Test',
        avatarUrl: null,
        createdAt: new Date(),
        roles: [{ role: { name: 'VIEWER' } }],
      };
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(user as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jest.spyOn(jwtService, 'signAsync')
        .mockResolvedValueOnce('mock-access-token')
        .mockResolvedValueOnce('mock-refresh-token');
      jest.spyOn(prisma.refreshToken, 'create').mockResolvedValue({} as any);

      const result = await service.login(dto);

      expect(bcrypt.compare).toHaveBeenCalledWith(dto.password, user.passwordHash);
      expect(jwtService.signAsync).toHaveBeenCalledWith(
        { sub: user.id, email: user.email, roles: ['VIEWER'] },
        { expiresIn: '15m' },
      );
      expect(result.accessToken).toBe('mock-access-token');
      expect(result.refreshToken).toBe('mock-refresh-token');
      expect(result.expiresIn).toBe(900);
    });

    it('should throw UnauthorizedException if user not found', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);

      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException if password does not match', async () => {
      const user = {
        id: 'uuid-123',
        email: dto.email,
        passwordHash: 'mock-hash',
        status: 'ACTIVE',
        failedLoginAttempts: 0,
      };
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(user as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      jest.spyOn(prisma.user, 'update').mockResolvedValue(user as any);
      jest.spyOn(prisma.auditLog, 'create').mockResolvedValue({} as any);

      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
      expect(jwtService.signAsync).not.toHaveBeenCalled();
    });
  });
});
