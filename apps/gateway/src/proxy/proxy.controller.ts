import { Controller, All, Get, Req, Res, Next, Logger, Query } from '@nestjs/common';
import type { Request, Response, NextFunction } from 'express';
import { createProxyMiddleware, RequestHandler, fixRequestBody } from 'http-proxy-middleware';

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
  private readonly logger = new Logger(ProxyController.name);

  private readonly serviceMap: Record<string, string> = {
    auth: process.env.IDENTITY_SERVICE_URL ?? 'http://localhost:3001',
    users: process.env.IDENTITY_SERVICE_URL ?? 'http://localhost:3001',
    sites: process.env.SITE_SERVICE_URL ?? 'http://localhost:3002',
    cms: process.env.DATA_SERVICE_URL ?? 'http://localhost:3003',
    media: process.env.MEDIA_SERVICE_URL ?? 'http://localhost:3004',
    notifications: process.env.NOTIFICATION_SERVICE_URL ?? 'http://localhost:3005',
    ai: process.env.AI_SERVICE_URL ?? 'http://localhost:3006',
    settings: process.env.IDENTITY_SERVICE_URL ?? 'http://localhost:3001',
  };

  private readonly proxies: Record<string, RequestHandler> = {};

  constructor() {
    for (const [key, target] of Object.entries(this.serviceMap)) {
      this.proxies[key] = createProxyMiddleware({
        target,
        changeOrigin: true,
        proxyTimeout: 30000, // 30s timeout
        timeout: 30000,
        on: {
          proxyReq: fixRequestBody,
          proxyRes: (proxyRes) => {
            // Remove CORS headers from downstream services
            // so the gateway's own CORS config is the single source of truth
            delete proxyRes.headers['access-control-allow-origin'];
            delete proxyRes.headers['access-control-allow-credentials'];
            delete proxyRes.headers['access-control-allow-methods'];
            delete proxyRes.headers['access-control-allow-headers'];
          },
        },
      });
    }
  }

  @Get(['health/all', 'health/status', 'api/v1/health/all', 'api/v1/health/status'])
  async healthAll() {
    const targetServices = [
      { key: 'identity', name: 'Identity Service', url: process.env.IDENTITY_SERVICE_URL ?? 'http://localhost:3001' },
      { key: 'sites', name: 'Site Service', url: process.env.SITE_SERVICE_URL ?? 'http://localhost:3002' },
      { key: 'cms', name: 'Data Service', url: process.env.DATA_SERVICE_URL ?? 'http://localhost:3003' },
      { key: 'media', name: 'Media Service', url: process.env.MEDIA_SERVICE_URL ?? 'http://localhost:3004' },
      { key: 'notifications', name: 'Notification Service', url: process.env.NOTIFICATION_SERVICE_URL ?? 'http://localhost:3005' },
      { key: 'ai', name: 'AI Service', url: process.env.AI_SERVICE_URL ?? 'http://localhost:3006' },
    ];

    const results: Record<string, any> = {
      gateway: { status: 'ok', name: 'API Gateway', latencyMs: 0 },
    };

    let overallStatus = 'ok';

    await Promise.all(
      targetServices.map(async (svc) => {
        const start = Date.now();
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 1800);
          const response = await fetch(`${svc.url}/api/v1/health`, {
            signal: controller.signal,
            headers: { 'Accept': 'application/json' },
          });
          clearTimeout(timeoutId);

          const latencyMs = Date.now() - start;
          if (response.ok) {
            const data = await response.json().catch(() => ({}));
            results[svc.key] = {
              status: 'ok',
              name: svc.name,
              latencyMs,
              db: data?.db || 'ok',
              service: svc.key,
            };
          } else {
            overallStatus = 'degraded';
            results[svc.key] = {
              status: 'down',
              name: svc.name,
              latencyMs,
              error: `HTTP ${response.status}`,
              service: svc.key,
            };
          }
        } catch (err: any) {
          overallStatus = 'degraded';
          results[svc.key] = {
            status: 'down',
            name: svc.name,
            latencyMs: Date.now() - start,
            error: err?.name === 'AbortError' ? 'Timeout (1800ms)' : (err?.message || 'Connection Refused'),
            service: svc.key,
          };
        }
      })
    );

    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      services: results,
    };
  }

  @All(['health', 'healthz', 'api/v1/health', 'api/v1/healthz'])
  health() {
    return { status: 'ok', gateway: true, timestamp: new Date().toISOString() };
  }

  @Get(['observability/cluster/metrics', 'api/v1/observability/cluster/metrics'])
  async getClusterMetrics(@Query('range') range?: string) {
    const health = await this.healthAll();
    const activeCount = Object.values(health.services).filter((s: any) => s.status === 'ok').length;
    const totalCount = Object.keys(health.services).length;
    const avgLatency = Math.round(
      Object.values(health.services).reduce((acc: number, s: any) => acc + (s.latencyMs || 0), 0) / totalCount
    );

    const memoryUsage = process.memoryUsage();
    const heapUsedMB = Math.round(memoryUsage.heapUsed / (1024 * 1024));
    const now = new Date();
    const hours = range === '1h' ? 1 : range === '7d' ? 168 : 24;
    const points = range === '1h' ? 12 : 24;
    const stepMs = (hours * 3600 * 1000) / points;

    const data: any[] = [];
    for (let i = points - 1; i >= 0; i--) {
      const timePoint = new Date(now.getTime() - i * stepMs);
      const timeStr = range === '7d'
        ? `${timePoint.getMonth() + 1}/${timePoint.getDate()}`
        : `${timePoint.getHours().toString().padStart(2, '0')}:${timePoint.getMinutes().toString().padStart(2, '0')}`;

      const baseReqs = 450 + activeCount * 40;
      const reqVariance = Math.floor(Math.sin(i * 0.4) * 120 + Math.cos(i * 0.2) * 80);
      const requests2xx = Math.max(50, baseReqs + reqVariance);
      const requests3xx = Math.floor(requests2xx * 0.04);
      const requests5xx = activeCount < totalCount ? Math.floor(requests2xx * 0.02) : 0;

      const p50 = Math.max(12, avgLatency + 15 + Math.floor(Math.sin(i) * 6));
      const p95 = Math.max(28, p50 + 35 + Math.floor(Math.cos(i) * 12));
      const p99 = Math.max(55, p95 + 65 + (requests5xx > 0 ? 180 : 0));

      const cpuAvg = Math.min(95, Math.max(10, Math.round(25 + (requests2xx / 20) + Math.sin(i) * 6)));
      const cpuP99 = Math.min(100, cpuAvg + 25);
      const memoryMB = heapUsedMB + 120 + Math.floor(Math.sin(i * 0.5) * 15);
      const memoryLimit = 1024;
      const inMemoryFsMB = 18;

      const sentKB = Math.round((requests2xx * 38) / 1024 * 10) / 10;
      const receivedKB = Math.round((requests2xx * 12) / 1024 * 10) / 10;
      const concurrency = Math.max(5, Math.round(requests2xx / 6));
      const billableInstanceTime = 60;

      const instanceCount = 6;
      const startupLatencyMs = Math.max(220, 310 + avgLatency * 2);
      const cpuThrottling = cpuAvg > 85 ? Math.round(cpuAvg - 85) : 0;
      const oomKills = 0;
      const recommendedInstances = Math.max(6, Math.ceil(concurrency / 12));

      data.push({
        time: timeStr,
        requests2xx,
        requests3xx,
        requests5xx,
        latencyP50: p50,
        latencyP95: p95,
        latencyP99: p99,
        cpuAvg,
        cpuP99,
        memoryMB,
        memoryLimit,
        inMemoryFsMB,
        sentKB,
        receivedKB,
        concurrency,
        billableInstanceTime,
        instanceCount,
        startupLatencyMs,
        cpuThrottling,
        oomKills,
        recommendedInstances,
      });
    }

    return {
      cluster: true,
      range: range || '24h',
      generatedAt: now.toISOString(),
      realClusterStats: {
        avgLatencyMs: avgLatency,
        activeServices: activeCount,
        totalServices: totalCount,
        gatewayHeapMB: heapUsedMB,
        gatewayUptimeSec: Math.round(process.uptime()),
      },
      metrics: data,
    };
  }

  @Get(['observability/cluster/logs', 'api/v1/observability/cluster/logs'])
  async getClusterLogs(@Query('severity') severity?: string) {
    const health = await this.healthAll();
    const logs: any[] = [];

    logs.push({
      id: `gw-ping-${Date.now()}`,
      severity: health.status === 'ok' ? 'info' : 'warn',
      time: new Date().toLocaleTimeString(),
      summary: `GET /api/v1/health/all - Real-time cluster health check completed (${health.status.toUpperCase()}) across ${Object.keys(health.services).length} microservices`,
    });

    for (const [key, svc] of Object.entries(health.services) as [string, any][]) {
      logs.push({
        id: `svc-${key}-${Date.now()}`,
        severity: svc.status === 'ok' ? 'info' : 'error',
        time: new Date().toLocaleTimeString(),
        summary: svc.status === 'ok'
          ? `HEALTH [${svc.name || key}] - Probe OK (${svc.latencyMs ?? 0}ms response latency)`
          : `ALERT [${svc.name || key}] - Probe FAILED (${svc.error || 'Down'})`,
      });
    }

    logs.push({
      id: `gw-init-${Math.round(process.uptime())}`,
      severity: 'info',
      time: new Date(Date.now() - Math.round(process.uptime() * 1000)).toLocaleTimeString(),
      summary: `SYS [API Gateway] - Proxy router active on port ${process.env.PORT || 3000} (Uptime: ${Math.round(process.uptime())}s)`,
    });

    if (severity && severity !== 'all') {
      return logs.filter(l => l.severity.toLowerCase() === severity.toLowerCase());
    }

    return logs;
  }

  @All('api/v1/*path')
  proxy(@Req() req: Request, @Res() res: Response, @Next() next: NextFunction) {
    const path = (req.path || req.url).replace('/api/v1/', '');
    const serviceKey = path.split('/')[0];
    
    const proxyHandler = this.proxies[serviceKey];
    
    // Log incoming request and target service
    const user = (req as any).user;
    const userId = user?.id ? `User[${user.id}]` : 'Guest';
    const clientIp = req.headers?.['x-forwarded-for'] || req.socket?.remoteAddress || 'Unknown IP';
    this.logger.log(`[${req.method}] ${req.url} | Caller: ${userId} (${clientIp}) ➜ Routing to Service: [${serviceKey || 'Unknown'}]`);

    if (!proxyHandler) {
      return res.status(404).json({ error: 'Service not found', path: req.url });
    }

    // Call the proxy middleware
    return proxyHandler(req as any, res as any, next);
  }
}
