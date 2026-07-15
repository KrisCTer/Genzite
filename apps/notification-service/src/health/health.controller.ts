import { Controller, Get, Res } from '@nestjs/common';
import type { Response } from 'express';
import { PrismaService } from '../prisma/prisma.service.js';

@Controller()
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get(['healthz', 'health'])
  async check(@Res() res: Response) {
    const start = Date.now();
    let dbStatus = 'up';
    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch (e) {
      dbStatus = 'down';
    }
    const latencyMs = Date.now() - start;
    const status = dbStatus === 'up' ? 'ok' : 'degraded';
    
    return res.status(dbStatus === 'up' ? 200 : 503).json({
      status,
      service: 'notification-service',
      db: dbStatus,
      latencyMs,
      timestamp: new Date().toISOString(),
    });
  }
}
