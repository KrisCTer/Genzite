import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { IdentityProducer } from '../events/identity.producer';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

// Mock bcrypt
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
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              create: jest.fn(),
            },
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
      // Arrange
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);
      const createdUser = { id: 'uuid-123', ...dto, passwordHash: 'mock-hash' };
      jest.spyOn(prisma.user, 'create').mockResolvedValue(createdUser as any);

      // Act
      const result = await service.register(dto);

      // Assert
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
      // Arrange
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue({ id: 'existing' } as any);

      // Act & Assert
      await expect(service.register(dto)).rejects.toThrow(ConflictException);
      expect(prisma.user.create).not.toHaveBeenCalled();
      expect(identityProducer.emitUserRegistered).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    const dto = { email: 'test@test.com', password: 'password123' };

    it('should login successfully and return token', async () => {
      // Arrange
      const user = { id: 'uuid-123', email: dto.email, passwordHash: 'mock-hash' };
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(user as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jest.spyOn(jwtService, 'signAsync').mockResolvedValue('mock-jwt-token');

      // Act
      const result = await service.login(dto);

      // Assert
      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: dto.email } });
      expect(bcrypt.compare).toHaveBeenCalledWith(dto.password, user.passwordHash);
      expect(jwtService.signAsync).toHaveBeenCalledWith({ sub: user.id, email: user.email });
      expect(result).toEqual({ accessToken: 'mock-jwt-token', expiresIn: 86400 });
    });

    it('should throw UnauthorizedException if user not found', async () => {
      // Arrange
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);

      // Act & Assert
      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException if password does not match', async () => {
      // Arrange
      const user = { id: 'uuid-123', email: dto.email, passwordHash: 'mock-hash' };
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(user as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      // Act & Assert
      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
      expect(jwtService.signAsync).not.toHaveBeenCalled();
    });
  });
});
