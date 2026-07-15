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
        title: "Role Updated",
        body: `An administrator has updated your permissions. You are currently assigned the role: ${roleName}.`,
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
          title: "Role Update Successful",
          body: `You have successfully updated the permissions for user ${userId} to the role: ${roleName}.`,
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
        title: "Account Credited",
        body: `An admin has credited ${amount} GZ to your account. Your new balance is: ${newBalance} GZ.`,
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
        title: "Transaction Successful",
        body: `You have successfully credited ${amount} GZ to user ${userId}.`,
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
