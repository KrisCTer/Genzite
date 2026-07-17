import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";

import { PrismaService } from "../prisma/prisma.service";
import { Prisma } from "@prisma/client-site";
import { SiteProducer } from "../events/site.producer";
@Injectable()
export class WidgetsService {
  constructor(
    private prisma: PrismaService,
    private readonly siteProducer: SiteProducer,
  ) {}

  private async verifyPageOwnership(pageId: string, userId: string, userEmail?: string, action: 'read' | 'write' = 'read') {
    const page = await this.prisma.page.findUnique({
      where: {
        id: pageId,
      },
      include: {
        site: true,
      },
    });

    if (!page) {
      throw new NotFoundException("Page not found");
    }

    // Check shared access permissions (mirroring pages.service.ts)
    const isPublic = (page.site.settings as any)?.shareAccess === 'Public: Anyone with the link can view';
    const isRestricted = (page.site.settings as any)?.shareAccess === 'Restricted: Only people you specify can access';
    const sharedEmails = (page.site.settings as any)?.sharedEmails || [];
    const isSharedWithUser = isRestricted && userEmail && sharedEmails.includes(userEmail);

    if (page.site.ownerId !== userId && !isSharedWithUser) {
      // If it's a write action, public viewers are NEVER allowed
      if (action === 'write') {
        throw new ForbiddenException("You do not own this page and you are not a collaborator");
      }
      // If it's a read action, public viewers are allowed
      if (!isPublic) {
        throw new ForbiddenException("You do not own this page and it is not shared with you");
      }
    }

    return page;
  }

  async replaceWidgets(
    pageId: string,
    widgets: Array<{
      type: string;
      contentConfig: Record<string, unknown>;
      sortOrder: number;
    }>,
    userId: string,
    userEmail?: string,
  ) {
    // Step 2: Check permissions
    const page = await this.verifyPageOwnership(pageId, userId, userEmail, 'write');

    // Step 3: Delete old widgets, create new widgets, and create outbox event in a single transaction
    await this.prisma.$transaction([
      this.prisma.widget.deleteMany({
        where: {
          pageId,
        },
      }),
      this.prisma.widget.createMany({
        data: widgets.map((widget) => ({
          pageId,
          type: widget.type,
          contentConfig: widget.contentConfig as Prisma.InputJsonValue,
          sortOrder: widget.sortOrder,
        })),
      }),
      this.prisma.outboxEvent.create({
        data: {
          eventType: 'WIDGET_CONFIG_CHANGED',
          payload: {
            pageId,
            siteId: page.siteId,
            widgetCount: widgets.length,
          } as Prisma.InputJsonValue,
        },
      })
    ]);
    // Step 5: Return the newly created widget list
    return this.prisma.widget.findMany({
      where: {
        pageId,
      },
      orderBy: {
        sortOrder: "asc",
      },
    });
  }

  async findByPageId(pageId: string, userId: string, userEmail?: string) {
    await this.verifyPageOwnership(pageId, userId, userEmail);

    return this.prisma.widget.findMany({
      where: {
        pageId,
      },
      include: {
        page: {
          select: { siteId: true },
        },
      },
      orderBy: {
        sortOrder: "asc",
      },
    });
  }

  async findByPageIdPublic(pageId: string) {
    // Public read — no ownership check, used by /live viewer
    const page = await this.prisma.page.findUnique({ where: { id: pageId } });
    if (!page) throw new NotFoundException('Page not found');

    return this.prisma.widget.findMany({
      where: { pageId },
      include: {
        page: { select: { siteId: true } },
      },
      orderBy: { sortOrder: 'asc' },
    });
  }
}
