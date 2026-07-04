import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ProxyController } from './proxy/proxy.controller.js';
import { AuthMiddleware } from './auth/auth.middleware.js';
import { RateLimitMiddleware } from './rate-limit/rate-limit.middleware.js';

@Module({
  imports: [],
  controllers: [ProxyController],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RateLimitMiddleware, AuthMiddleware).forRoutes('*');
  }
}
