import { RateLimitMiddleware } from './rate-limit.middleware';
import { HttpException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

describe('RateLimitMiddleware', () => {
  let middleware: RateLimitMiddleware;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    middleware = new RateLimitMiddleware();
    req = {
      ip: '127.0.0.1',
    };
    res = {};
    next = jest.fn();
  });

  it('should allow first request', () => {
    middleware.use(req as Request, res as Response, next);
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('should allow up to maxRequests', () => {
    for (let i = 0; i < 100; i++) {
      middleware.use(req as Request, res as Response, next);
    }
    expect(next).toHaveBeenCalledTimes(100);
  });

  it('should throw HttpException after maxRequests', () => {
    for (let i = 0; i < 100; i++) {
      middleware.use(req as Request, res as Response, next);
    }
    
    expect(() => middleware.use(req as Request, res as Response, next)).toThrow(HttpException);
  });

  it('should reset after windowMs', () => {
    jest.useFakeTimers();
    
    for (let i = 0; i < 100; i++) {
      middleware.use(req as Request, res as Response, next);
    }
    
    expect(() => middleware.use(req as Request, res as Response, next)).toThrow(HttpException);
    
    // Advance time past 1 minute
    jest.advanceTimersByTime(60_001);
    
    // Should work again
    middleware.use(req as Request, res as Response, next);
    expect(next).toHaveBeenCalledTimes(101);
    
    jest.useRealTimers();
  });
});
