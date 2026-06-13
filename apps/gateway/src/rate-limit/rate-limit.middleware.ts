import { Injectable, NestMiddleware, HttpException, HttpStatus } from '@nestjs/common';
import type { Request, Response, NextFunction } from 'express';

/**
 * Simple in-memory rate limiter for the API Gateway.
 * In production, use Redis-based rate limiting.
 */
@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  private readonly windowMs = 60_000; // 1 minute
  private readonly maxRequests = 100;  // max requests per window per IP
  private readonly store = new Map<string, { count: number; resetAt: number }>();

  use(req: Request, res: Response, next: NextFunction) {
    const ip = req.ip ?? req.socket.remoteAddress ?? 'unknown';
    const now = Date.now();
    const record = this.store.get(ip);

    if (!record || now > record.resetAt) {
      this.store.set(ip, { count: 1, resetAt: now + this.windowMs });
      return next();
    }

    if (record.count >= this.maxRequests) {
      throw new HttpException('Too Many Requests', HttpStatus.TOO_MANY_REQUESTS);
    }

    record.count++;
    next();
  }
}
