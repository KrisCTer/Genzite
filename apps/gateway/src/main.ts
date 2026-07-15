import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bodyParser: false });
  
  // Security Headers
  app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    frameguard: false,
    contentSecurityPolicy: false,
  }));

  app.enableCors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      const isAllowed =
        !origin ||
        origin.includes('localhost') ||
        origin.endsWith('.codespheree.id.vn') ||
        origin === 'https://codespheree.id.vn' ||
        origin === 'http://codespheree.id.vn' ||
        origin.endsWith('.genzite.studio') ||
        origin.endsWith('.genzite.com') ||
        origin.endsWith('.genzite.ai') ||
        (process.env.FRONTEND_URL && process.env.FRONTEND_URL.split(',').includes(origin));

      if (isAllowed || process.env.NODE_ENV !== 'production') {
        callback(null, true);
      } else {
        console.warn(`[API Gateway CORS] Unrecognized origin attempted access: ${origin}`);
        callback(null, true);
      }
    },
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization, x-requested-with',
  });
  await app.listen(process.env.PORT ?? 3000);
  console.log(`[API Gateway] Running on port ${process.env.PORT ?? 3000}`);
}
bootstrap();
