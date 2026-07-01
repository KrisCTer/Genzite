import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module.js";
import { ValidationPipe } from "@nestjs/common";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  
  // Port 3007 for commerce-service
  const port = process.env.PORT || 3007;
  await app.listen(port);
  console.log(`Commerce Service is running on port ${port}`);
}
bootstrap();
