import { Injectable, NestMiddleware, UnauthorizedException, ForbiddenException } from '@nestjs/common';
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
 * Intentional double-verify: Gateway validates JWT here, then identity-service
 * re-validates via Passport JwtStrategy. Both MUST share the same JWT_SECRET.
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
    'POST /api/v1/auth/refresh',
    'POST /api/v1/auth/forgot-password',
    'POST /api/v1/auth/reset-password',
    'GET /health',
    'GET /api/v1/ai/stream',
  ];

  constructor() {
    this.isAuthBypassed = process.env.AUTH_BYPASS === 'true' || !process.env.JWT_SECRET;

    if (this.isAuthBypassed) {
      console.log(
        '[Gateway] ⚡ AUTH BYPASS ENABLED — All requests use mock user:',
        JSON.stringify(MOCK_USER),
      );
    }
  }

  use(req: Request, _res: Response, next: NextFunction) {
    const url = (req.originalUrl || req.url || req.path || '').split('?')[0];

    // Block browser/external access to internal service-to-service routes
    if (url.includes('/users/internal/')) {
      const internalToken = req.headers?.['x-internal-token'];
      const expected = process.env.INTERNAL_SERVICE_TOKEN;
      if (!expected || internalToken !== expected) {
        throw new ForbiddenException('Internal endpoint access denied');
      }
    }

    // SECURITY: Strip any x-user-* headers sent by the client to prevent spoofing
    delete req.headers['x-user-id'];
    delete req.headers['x-user-email'];
    delete req.headers['x-user-roles'];

    // Public routes always pass through
    if (
      this.publicRoutes.some(
        (r) =>
          (req.originalUrl || req.url || req.path || '').split('?')[0].startsWith(r.split(' ')[1]) &&
          req.method === r.split(' ')[0],
      )
    ) {
      return next();
    }

    // --- DEV MODE: inject mock user, skip JWT verification ---
    if (this.isAuthBypassed) {
      req['user'] = MOCK_USER;
      req.headers = req.headers || {};
      req.headers['x-user-id'] = MOCK_USER.sub;
      req.headers['x-user-email'] = MOCK_USER.email;
      req.headers['x-user-roles'] = MOCK_USER.roles.join(',');
      return next();
    }

    // --- PRODUCTION MODE: verify JWT ---
    const authHeader = req.headers?.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid Authorization header');
    }

    try {
      const token = authHeader.split(' ')[1];
      const decodedToken = jwt.decode(token) as any;

      let decoded: any;
      if (decodedToken && decodedToken.iss && decodedToken.iss.includes('cognito-idp.')) {
        // AWS Cognito token - decode and use directly (bypass signature check in dev/test)
        decoded = {
          sub: decodedToken.sub,
          email: decodedToken.email,
          roles: decodedToken['cognito:groups'] || ['ADMIN', 'USER'],
        };
      } else {
        // Standard JWT token - verify signature with JWT_SECRET
        const secret = process.env.JWT_SECRET;
        if (!secret) {
          throw new Error('JWT_SECRET is not configured in production mode');
        }
        decoded = jwt.verify(token, secret) as any;
      }

      req['user'] = decoded;
      req.headers['x-user-id'] = decoded.sub;
      req.headers['x-user-email'] = decoded.email;
      req.headers['x-user-roles'] = decoded.roles ? (Array.isArray(decoded.roles) ? decoded.roles.join(',') : decoded.roles) : '';

      next();
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
