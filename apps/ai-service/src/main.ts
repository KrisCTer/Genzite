import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module.js';
import { GeminiExceptionFilter } from './common/filters/gemini-exception.filter.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.enableCors();
  app.useGlobalFilters(new GeminiExceptionFilter());

  const port = process.env.PORT ?? 3006;
  await app.listen(port);
  new Logger('Bootstrap').log(`AI Service running on port ${port}`);
}
bootstrap();
