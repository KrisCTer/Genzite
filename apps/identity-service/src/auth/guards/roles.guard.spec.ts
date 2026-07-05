import { RolesGuard } from './roles.guard.js';
import { Reflector } from '@nestjs/core';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
  });

  const createMockContext = (user: any): ExecutionContext => {
    return {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      getArgs: jest.fn(),
      getArgByIndex: jest.fn(),
      switchToRpc: jest.fn(),
      switchToWs: jest.fn(),
      getType: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => ({ user }),
        getResponse: jest.fn(),
        getNext: jest.fn(),
      }),
    } as any;
  };

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should allow access if no roles are required', () => {
    jest.spyOn(reflector, 'get').mockReturnValue(undefined);
    const context = createMockContext({});
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should throw ForbiddenException if user has no roles field in JWT payload', () => {
    jest.spyOn(reflector, 'get').mockReturnValue(['admin']);
    // JWT payload misses the roles field completely (like old tokens)
    const context = createMockContext({ sub: 'user-1', email: 'test@example.com' });
    
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    expect(() => guard.canActivate(context)).toThrow('Insufficient permissions');
  });

  it('should throw ForbiddenException if user has empty roles array []', () => {
    jest.spyOn(reflector, 'get').mockReturnValue(['admin']);
    // User has roles field, but it's empty
    const context = createMockContext({ sub: 'user-1', email: 'test@example.com', roles: [] });
    
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('should throw ForbiddenException if user roles do not match required roles', () => {
    jest.spyOn(reflector, 'get').mockReturnValue(['admin']);
    const context = createMockContext({ sub: 'user-1', email: 'test@example.com', roles: ['user'] });
    
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('should allow access if user has the exact required role', () => {
    jest.spyOn(reflector, 'get').mockReturnValue(['admin']);
    const context = createMockContext({ sub: 'user-1', email: 'test@example.com', roles: ['admin'] });
    
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should allow access if user has MULTIPLE roles and the required role is NOT at the first position', () => {
    jest.spyOn(reflector, 'get').mockReturnValue(['admin']);
    // 'admin' is the second element
    const context = createMockContext({ sub: 'user-1', email: 'test@example.com', roles: ['editor', 'admin', 'viewer'] });
    
    expect(guard.canActivate(context)).toBe(true);
  });
});
