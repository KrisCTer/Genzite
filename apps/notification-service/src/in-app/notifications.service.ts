import { Injectable } from "@nestjs/common";
import { NotificationType } from "@prisma/client-notification";
import { PrismaService } from "../prisma/prisma.service.js";

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async createWelcomeNotification(userId: string) {
    return this.prisma.notification.create({
      data: {
        userId,
        type: NotificationType.IN_APP,
        title: "Welcome to Genzite!",
        body: "Thank you for registering an account.",
        metadata: {
          event: "user.registered",
        },
      },
    });
  }

  async createRoleAssignedNotification(userId: string, roleName: string, adminId?: string) {
    const userNotif = await this.prisma.notification.create({
      data: {
        userId,
        type: NotificationType.IN_APP,
        title: "Quyền hạn thay đổi",
        body: `Quản trị viên đã cập nhật phân quyền của bạn. Hiện tại bạn đang giữ vai trò: ${roleName}.`,
        metadata: {
          event: "role.assigned",
          roleName,
        },
      },
    });

    if (adminId && adminId !== userId) {
      await this.prisma.notification.create({
        data: {
          userId: adminId,
          type: NotificationType.IN_APP,
          title: "Cập nhật quyền thành công",
          body: `Bạn đã cập nhật quyền hạn cho người dùng ${userId} thành vai trò: ${roleName}.`,
          metadata: {
            event: "role.assigned.admin",
            targetUserId: userId,
            roleName,
          },
        },
      });
    }

    return userNotif;
  }

  async createCreditsAdjustedNotification(userId: string, adminId: string, amount: number, newBalance: number) {
    // 1. Notify the user
    await this.prisma.notification.create({
      data: {
        userId,
        type: NotificationType.IN_APP,
        title: "Tài khoản được cộng tiền",
        body: `Admin đã nạp ${amount} GZ vào tài khoản của bạn. Số dư hiện tại: ${newBalance} GZ.`,
        metadata: {
          event: "credits.adjusted",
          adminId,
        },
      },
    });

    // 2. Notify the admin
    await this.prisma.notification.create({
      data: {
        userId: adminId,
        type: NotificationType.IN_APP,
        title: "Giao dịch thành công",
        body: `Bạn đã nạp thành công ${amount} GZ cho user ${userId}.`,
        metadata: {
          event: "credits.adjusted",
          targetUserId: userId,
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
        title: "CV Analysis Result is Ready",
        body: `Your CV has been analyzed. ATS Score: ${atsScore}.`,
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
        title: "Mock Interview Report Completed",
        body: `Your overall evaluation score is ${overallScore}.`,
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
        title: `Website ${siteName} created successfully!`,
        body: "You can start editing your website now.",
        metadata: {
          siteId,
          siteName,
          event: "site.created",
        },
      },
    });
  }

  async createSiteGeneratedNotification(ownerId: string, siteId: string) {
    return this.prisma.notification.create({
      data: {
        userId: ownerId,
        type: NotificationType.IN_APP,
        title: "Your AI Website is fully initialized!",
        body: "Please check the automatically generated interface and content.",
        metadata: {
          siteId,
          event: "site.generated",
        },
      },
    });
  }

  async createCmsGeneratedNotification(ownerId: string, siteId: string) {
    return this.prisma.notification.create({
      data: {
        userId: ownerId,
        type: NotificationType.IN_APP,
        title: "CMS Structure Initialized",
        body: "The CMS Collections are ready for you to add data.",
        metadata: {
          siteId,
          event: "cms.generated",
        },
      },
    });
  }
}
