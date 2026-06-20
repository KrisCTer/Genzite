import { Controller, All, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';

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

  @All('api/v1/*path')
  async proxy(@Req() req: Request, @Res() res: Response) {
    const path = req.url.replace('/api/v1/', '');
    const serviceKey = path.split('/')[0];
    const targetBase = this.serviceMap[serviceKey];

    if (!targetBase) {
      return res.status(404).json({ error: 'Service not found', path: req.url });
    }

    const targetUrl = `${targetBase}${req.url}`;

    try {
      const response = await fetch(targetUrl, {
        method: req.method,
        headers: {
          'Content-Type': 'application/json',
          // Forward auth headers
          ...(req.headers.authorization ? { Authorization: req.headers.authorization } : {}),
          // Forward user identity (from JWT or mock user)
          ...(req.headers['x-user-id'] ? { 'x-user-id': req.headers['x-user-id'] as string } : {}),
          ...(req.headers['x-user-email'] ? { 'x-user-email': req.headers['x-user-email'] as string } : {}),
          ...(req.headers['x-user-roles'] ? { 'x-user-roles': req.headers['x-user-roles'] as string } : {}),
        },
        ...(req.method !== 'GET' && req.method !== 'HEAD' ? { body: JSON.stringify(req.body) } : {}),
      });

      const data = await response.json();
      return res.status(response.status).json(data);
    } catch (error) {
      return res.status(502).json({ error: 'Bad Gateway', message: `Failed to reach ${serviceKey} service` });
    }
  }

  @All('health')
  health() {
    return { status: 'ok', gateway: true, timestamp: new Date().toISOString() };
  }
}
