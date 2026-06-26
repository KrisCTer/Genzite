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

  const createMockContext = (authorizationHeader?: string): ExecutionContext => {
    const mockRequest = {
      headers: {
        authorization: authorizationHeader,
      },
    };
    return {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as any;
  };

  it('should throw UnauthorizedException if no authorization header is provided', async () => {
    const context = createMockContext(undefined);
    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException if authorization header does not start with Bearer', async () => {
    const context = createMockContext('Basic xyz');
    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException if token is invalid', async () => {
    const context = createMockContext('Bearer invalid-token');
    jest.spyOn(jwtService, 'verifyAsync').mockRejectedValue(new Error('Invalid token'));

    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
    expect(jwtService.verifyAsync).toHaveBeenCalledWith('invalid-token', { secret: 'mock-secret' });
  });

  it('should return true and attach user to request if token is valid', async () => {
    const context = createMockContext('Bearer valid-token');
    const mockPayload = { sub: 'user-id', email: 'test@test.com' };
    jest.spyOn(jwtService, 'verifyAsync').mockResolvedValue(mockPayload);

    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    const request = context.switchToHttp().getRequest();
    expect(request.user).toEqual(mockPayload);
  });
});
