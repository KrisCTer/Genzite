import * as dotenv from 'dotenv';
dotenv.config({ path: '../../infra/.env' });
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { GenerationModule } from './generation/generation.module.js';
import { SiteGeneratorService } from './generation/site-generator.service.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    GenerationModule,
  ],
})
class TestModule {}

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(TestModule);
  const generator = app.get(SiteGeneratorService);
  
  console.log('Starting test generation loop with Stitch and Groq...');
  try {
    const result = await generator.generate(
      'A beautiful SaaS landing page with dark theme and pricing section',
      undefined,
      undefined,
      (step, percent) => {
        console.log(`[Progress] ${step} - ${percent}%`);
      }
    );
    console.log('\n[SUCCESS] Generation completed successfully!');
    console.log(result);
  } catch (error) {
    console.error('\n[FAILED] Test failed:', error);
  }
  
  await app.close();
  process.exit(0);
}
bootstrap();
