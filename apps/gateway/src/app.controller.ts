import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get('health')
  healthCheck() {
    return { status: 'OK', timestamp: new Date().toISOString() };
  }
}
