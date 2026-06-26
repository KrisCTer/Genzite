import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";

import { PrismaService } from "../prisma/prisma.service";
import { Prisma } from "@prisma/client";
import { SiteProducer } from "../events/site.producer";
@Injectable()
export class WidgetsService {
  constructor(
    private prisma: PrismaService,
    private readonly siteProducer: SiteProducer,
  ) {}

  // Step 1: Check if page exists and user has permission
  private async verifyPageOwnership(pageId: string, userId: string) {
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

    if (page.site.ownerId !== userId) {
      throw new ForbiddenException("You do not own this page");
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
  ) {
    // Step 2: Check permissions
    const page = await this.verifyPageOwnership(pageId, userId);

    // Step 3: Delete all old widgets of the page
    await this.prisma.widget.deleteMany({
      where: {
        pageId,
      },
    });

    // Step 4: Recreate new widgets
    await this.prisma.widget.createMany({
      data: widgets.map((widget) => ({
        pageId,
        type: widget.type,
        contentConfig: widget.contentConfig as Prisma.InputJsonValue,
        sortOrder: widget.sortOrder,
      })),
    });
    // B5: Emit Kafka event
    await this.siteProducer.emitWidgetConfigChanged({
      pageId,
      siteId: page.siteId,
      widgetCount: widgets.length,
    });
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

  async findByPageId(pageId: string, userId: string) {
    await this.verifyPageOwnership(pageId, userId);

    return this.prisma.widget.findMany({
      where: {
        pageId,
      },
      orderBy: {
        sortOrder: "asc",
      },
    });
  }
}
