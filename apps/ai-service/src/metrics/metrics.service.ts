import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class MetricsService {
  constructor(private prisma: PrismaService) {}

  async getSummary() {
    const totalTasks = await this.prisma.aiTaskLog.count();
    const successfulTasks = await this.prisma.aiTaskLog.count({
      where: { status: 'COMPLETED' },
    });
    const failedTasks = await this.prisma.aiTaskLog.count({
      where: { status: 'FAILED' },
    });

    // Aggregate token usage and cost
    const aggregates = await this.prisma.aiTaskLog.aggregate({
      _sum: {
        tokenUsage: true,
        cost: true,
      },
    });

    const recentLogs = await this.prisma.aiTaskLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const logsLast7Days = await this.prisma.aiTaskLog.findMany({
      where: { createdAt: { gte: sevenDaysAgo } },
      select: { createdAt: true, tokenUsage: true }
    });

    const chartDataObj: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayStr = d.toLocaleDateString('en-US', { weekday: 'short' });
      chartDataObj[dayStr] = 0;
    }

    logsLast7Days.forEach(log => {
      const dayStr = log.createdAt.toLocaleDateString('en-US', { weekday: 'short' });
      if (chartDataObj[dayStr] !== undefined) {
        chartDataObj[dayStr] += (log.tokenUsage || 0);
      }
    });

    const chartData = Object.keys(chartDataObj).map(key => ({
      name: key,
      tokens: chartDataObj[key]
    }));

    return {
      totalTasks,
      successfulTasks,
      failedTasks,
      totalTokenUsage: aggregates._sum.tokenUsage || 0,
      totalCost: aggregates._sum.cost || 0,
      recentLogs,
      chartData,
    };
  }
}
