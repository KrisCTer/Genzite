import { Module } from '@nestjs/common';
import { NotificationsController } from './in-app/notifications.controller.js';
import { NotificationsService } from './in-app/notifications.service.js';

@Module({
  imports: [],
  controllers: [NotificationsController],
  providers: [NotificationsService],
})
export class AppModule {}
