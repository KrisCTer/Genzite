import { Injectable } from '@nestjs/common';

@Injectable()
export class NotificationsService {
  async findByUserId(userId: string) {
    // TODO: Query DB via Prisma
    return [];
  }

  async markAsRead(notificationId: string) {
    // TODO: Update via Prisma
    return { id: notificationId, isRead: true };
  }
}
