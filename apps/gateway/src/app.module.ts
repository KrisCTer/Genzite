import { Module } from '@nestjs/common';
import { ProxyController } from './proxy/proxy.controller.js';

@Module({
  imports: [],
  controllers: [ProxyController],
  providers: [],
})
export class AppModule {}
