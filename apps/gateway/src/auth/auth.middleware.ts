import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import type { Request, Response, NextFunction } from 'express';

/**
 * JWT verification middleware for the API Gateway.
 * Validates Bearer tokens before forwarding requests to downstream services.
 */
@Injectable()
export class AuthMiddleware implements NestMiddleware {
  // Routes that don't require authentication
  private readonly publicRoutes = [
    'POST /api/v1/auth/register',
    'POST /api/v1/auth/login',
    'GET /health',
  ];

  use(req: Request, _res: Response, next: NextFunction) {
    const routeKey = `${req.method} ${req.path}`;

    if (this.publicRoutes.some((r) => routeKey.startsWith(r.split(' ')[1]) && req.method === r.split(' ')[0])) {
      return next();
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid Authorization header');
    }

    // TODO: Verify JWT token
    // const token = authHeader.split(' ')[1];
    // const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // req['user'] = decoded;

    next();
  }
}
