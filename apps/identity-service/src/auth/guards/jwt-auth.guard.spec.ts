import { Test, TestingModule } from '@nestjs/testing';
import { JwtAuthGuard } from './jwt-auth.guard';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let jwtService: JwtService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtAuthGuard,
        {
          provide: JwtService,
          useValue: {
            verifyAsync: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('mock-secret'),
          },
        },
      ],
    }).compile();

    guard = module.get<JwtAuthGuard>(JwtAuthGuard);
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);
  });

  const createMockContext = (headers: Record<string, string>): ExecutionContext => {
    const mockRequest = {
      headers: headers || {},
    };
    return {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as any;
  };

  it('should throw UnauthorizedException if no user headers are provided and passport fails', async () => {
    const context = createMockContext({});
    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
    await expect(guard.canActivate(context)).rejects.toThrow('Authentication failed or token expired');
  });

  it('should return true and attach user to request if gateway headers x-user-id and x-user-email are valid', async () => {
    const context = createMockContext({
      'x-user-id': 'user-123',
      'x-user-email': 'test@example.com',
      'x-user-roles': 'ADMIN,USER',
    });

    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    const request = context.switchToHttp().getRequest();
    expect(request.user).toEqual({
      sub: 'user-123',
      email: 'test@example.com',
      roles: ['ADMIN', 'USER'],
    });
  });
});
