import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ProxyController } from './proxy/proxy.controller.js';
import { AuthMiddleware } from './auth/auth.middleware.js';

@Module({
  imports: [],
  controllers: [ProxyController],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes('*');
  }
}
