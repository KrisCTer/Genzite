import { AuthMiddleware } from './auth.middleware';
import { UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

// Mock jsonwebtoken
jest.mock('jsonwebtoken');

describe('AuthMiddleware', () => {
  let middleware: AuthMiddleware;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    // Reset env vars before each test
    delete process.env.AUTH_BYPASS;
    delete process.env.JWT_SECRET;
    
    req = {
      method: 'GET',
      path: '/api/v1/protected',
      headers: {},
    };
    res = {};
    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should bypass auth on public routes', () => {
    process.env.JWT_SECRET = 'test-secret';
    middleware = new AuthMiddleware();
    
    req = { method: 'POST', path: '/api/v1/auth/login', headers: {} } as Partial<Request>;
    
    middleware.use(req as Request, res as Response, next);
    
    expect(next).toHaveBeenCalled();
    expect(req['user']).toBeUndefined();
  });

  it('should inject mock user when AUTH_BYPASS is true', () => {
    process.env.AUTH_BYPASS = 'true';
    middleware = new AuthMiddleware();
    
    middleware.use(req as Request, res as Response, next);
    
    expect(next).toHaveBeenCalled();
    expect(req['user']).toBeDefined();
    expect(req.headers!['x-user-id']).toBe('dev-mock-user-001');
  });

  it('should throw UnauthorizedException if no auth header in production', () => {
    process.env.JWT_SECRET = 'prod-secret';
    middleware = new AuthMiddleware();
    
    expect(() => middleware.use(req as Request, res as Response, next)).toThrow(UnauthorizedException);
  });

  it('should verify JWT and inject user in production', () => {
    process.env.JWT_SECRET = 'prod-secret';
    middleware = new AuthMiddleware();
    
    req.headers!.authorization = 'Bearer valid-token';
    
    (jwt.verify as jest.Mock).mockReturnValue({
      sub: 'user-1',
      email: 'test@test.com',
      roles: ['USER'],
    });

    middleware.use(req as Request, res as Response, next);
    
    expect(jwt.verify).toHaveBeenCalledWith('valid-token', 'prod-secret');
    expect(next).toHaveBeenCalled();
    expect(req['user']).toBeDefined();
    expect(req.headers!['x-user-id']).toBe('user-1');
  });

  it('should throw UnauthorizedException if token is invalid', () => {
    process.env.JWT_SECRET = 'prod-secret';
    middleware = new AuthMiddleware();
    
    req.headers!.authorization = 'Bearer invalid-token';
    
    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw new Error('Invalid token');
    });

    expect(() => middleware.use(req as Request, res as Response, next)).toThrow(UnauthorizedException);
  });
});
