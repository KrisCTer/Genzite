import { Controller, Get, UseGuards } from '@nestjs/common';
import { MetricsService } from './metrics.service.js';

@Controller('ai/admin/metrics')
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get('summary')
  async getSummary() {
    return this.metricsService.getSummary();
  }
}
