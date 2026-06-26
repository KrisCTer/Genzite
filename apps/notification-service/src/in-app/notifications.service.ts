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
