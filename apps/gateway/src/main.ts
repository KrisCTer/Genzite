import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: true,
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization, x-user-id',
  });
  await app.listen(process.env.PORT ?? 3000);
  console.log(`[API Gateway] Running on port ${process.env.PORT ?? 3000}`);
}
bootstrap();
