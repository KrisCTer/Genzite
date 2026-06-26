import { Controller, All, Req, Res, Next } from '@nestjs/common';
import type { Request, Response, NextFunction } from 'express';
import { createProxyMiddleware, RequestHandler } from 'http-proxy-middleware';

/**
 * API Gateway Proxy Controller
 *
 * Routes incoming requests to the appropriate downstream microservice
 * based on URL path prefix.
 *
 * Route mapping:
 *   /api/v1/auth/*          → Identity Service (port 3001)
 *   /api/v1/users/*         → Identity Service (port 3001)
 *   /api/v1/sites/*         → Site Service     (port 3002)
 *   /api/v1/cms/*           → Data Service     (port 3003)
 *   /api/v1/media/*         → Media Service    (port 3004)
 *   /api/v1/notifications/* → Notification Svc (port 3005)
 *   /api/v1/ai/*            → AI Service       (port 3006)
 */
@Controller()
export class ProxyController {
  private readonly serviceMap: Record<string, string> = {
    auth: process.env.IDENTITY_SERVICE_URL ?? 'http://localhost:3001',
    users: process.env.IDENTITY_SERVICE_URL ?? 'http://localhost:3001',
    sites: process.env.SITE_SERVICE_URL ?? 'http://localhost:3002',
    cms: process.env.DATA_SERVICE_URL ?? 'http://localhost:3003',
    media: process.env.MEDIA_SERVICE_URL ?? 'http://localhost:3004',
    notifications: process.env.NOTIFICATION_SERVICE_URL ?? 'http://localhost:3005',
    ai: process.env.AI_SERVICE_URL ?? 'http://localhost:3006',
  };

  private readonly proxies: Record<string, RequestHandler> = {};

  constructor() {
    for (const [key, target] of Object.entries(this.serviceMap)) {
      this.proxies[key] = createProxyMiddleware({
        target,
        changeOrigin: true,
        // Optional: you can add onProxyReq here to inject custom headers if needed
        // but auth.middleware already sets req.headers['x-user-id'] which proxy auto-forwards
      });
    }
  }

  @All('api/v1/*path')
  proxy(@Req() req: Request, @Res() res: Response, @Next() next: NextFunction) {
    const path = req.url.replace('/api/v1/', '');
    const serviceKey = path.split('/')[0];
    
    const proxyHandler = this.proxies[serviceKey];
    
    if (!proxyHandler) {
      return res.status(404).json({ error: 'Service not found', path: req.url });
    }

    // Call the proxy middleware
    return proxyHandler(req as any, res as any, next);
  }

  @All('health')
  health() {
    return { status: 'ok', gateway: true, timestamp: new Date().toISOString() };
  }
}
