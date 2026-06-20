import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module.js';
import { NotificationsController } from './in-app/notifications.controller.js';
import { NotificationsService } from './in-app/notifications.service.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService],
})
export class AppModule {}
