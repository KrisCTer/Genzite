import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import type { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';

/** Mock user injected when identity-service is not running (dev mode). */
const MOCK_USER = {
  sub: 'dev-mock-user-001',
  email: 'dev@genzite.local',
  roles: ['ADMIN', 'USER'],
};

/**
 * JWT verification middleware for the API Gateway.
 *
 * DEV MODE (`AUTH_BYPASS=true` or no `JWT_SECRET`):
 *   - Skips token verification entirely
 *   - Injects a mock ADMIN user into every request
 *   - Identity-service does NOT need to be running
 *
 * PRODUCTION MODE:
 *   - Validates Bearer tokens and extracts user from JWT
 *   - Rejects requests without valid tokens (except public routes)
 */
@Injectable()
export class AuthMiddleware implements NestMiddleware {
  private readonly isAuthBypassed: boolean;

  // Routes that never require authentication (even in production)
  private readonly publicRoutes = [
    'POST /api/v1/auth/register',
    'POST /api/v1/auth/login',
    'GET /health',
  ];

  constructor() {
    this.isAuthBypassed =
      process.env.AUTH_BYPASS === 'true' || !process.env.JWT_SECRET;

    if (this.isAuthBypassed) {
      console.log(
        '[Gateway] ⚡ AUTH BYPASS ENABLED — All requests use mock user:',
        JSON.stringify(MOCK_USER),
      );
    }
  }

  use(req: Request, _res: Response, next: NextFunction) {
    // Public routes always pass through
    if (
      this.publicRoutes.some(
        (r) =>
          req.path!.startsWith(r.split(' ')[1]) &&
          req.method === r.split(' ')[0],
      )
    ) {
      return next();
    }

    // --- DEV MODE: inject mock user, skip JWT verification ---
    if (this.isAuthBypassed) {
      req['user'] = MOCK_USER;
      req.headers['x-user-id'] = MOCK_USER.sub;
      req.headers['x-user-email'] = MOCK_USER.email;
      req.headers['x-user-roles'] = MOCK_USER.roles.join(',');
      return next();
    }

    // --- PRODUCTION MODE: verify JWT ---
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid Authorization header');
    }

    try {
      const token = authHeader.split(' ')[1];
      const secret = process.env.JWT_SECRET;
      
      if (!secret) {
        throw new Error('JWT_SECRET is not configured in production mode');
      }

      const decoded = jwt.verify(token, secret) as any;
      
      req['user'] = decoded;
      req.headers['x-user-id'] = decoded.sub;
      req.headers['x-user-email'] = decoded.email;
      req.headers['x-user-roles'] = decoded.roles ? decoded.roles.join(',') : '';

      next();
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
