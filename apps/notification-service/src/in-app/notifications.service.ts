import { Injectable } from "@nestjs/common";
import { NotificationType } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service.js";

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async createWelcomeNotification(userId: string) {
    return this.prisma.notification.create({
      data: {
        userId,
        type: NotificationType.IN_APP,
        title: "Chào mừng bạn đến với Genzite!",
        body: "Cảm ơn bạn đã đăng ký tài khoản.",
        metadata: {
          event: "user.registered",
        },
      },
    });
  }

  async findByUserId(userId: string, page = 1, limit = 20, unreadOnly = false) {
    return this.prisma.notification.findMany({
      where: {
        userId,
        ...(unreadOnly && {
          isRead: false,
        }),
      },
      orderBy: {
        createdAt: "desc",
      },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async markAsRead(notificationId: string, userId: string) {
    return this.prisma.notification.updateMany({
      where: {
        id: notificationId,
        userId,
      },
      data: {
        isRead: true,
      },
    });
  }

  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });
  }

  async createResumeAnalyzedNotification(
    ownerId: string,
    resumeId: string,
    atsScore: number,
  ) {
    return this.prisma.notification.create({
      data: {
        userId: ownerId,
        type: NotificationType.IN_APP,
        title: "Kết quả phân tích CV đã sẵn sàng",
        body: `CV của bạn đã được phân tích. ATS Score: ${atsScore}.`,
        metadata: {
          resumeId,
          atsScore,
          event: "resume.analyzed",
        },
      },
    });
  }

  async createInterviewCompletedNotification(
    ownerId: string,
    sessionId: string,
    resumeId: string,
    overallScore: number,
  ) {
    return this.prisma.notification.create({
      data: {
        userId: ownerId,
        type: NotificationType.IN_APP,
        title: "Báo cáo phỏng vấn thử đã hoàn thành",
        body: `Điểm đánh giá tổng thể của bạn là ${overallScore}.`,
        metadata: {
          sessionId,
          resumeId,
          overallScore,
          event: "interview.completed",
        },
      },
    });
  }

  async createSiteCreatedNotification(
    ownerId: string,
    siteId: string,
    siteName: string,
  ) {
    return this.prisma.notification.create({
      data: {
        userId: ownerId,
        type: NotificationType.IN_APP,
        title: `Website ${siteName} đã được tạo thành công!`,
        body: "Bạn có thể bắt đầu chỉnh sửa website ngay bây giờ.",
        metadata: {
          siteId,
          siteName,
          event: "site.created",
        },
      },
    });
  }
}
