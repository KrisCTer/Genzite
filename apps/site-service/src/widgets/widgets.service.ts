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

  // B1: Kiểm tra page tồn tại và user có quyền với page
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
    // B2: Check quyền
    const page = await this.verifyPageOwnership(pageId, userId);

    // B3: Xóa toàn bộ widget cũ của page
    await this.prisma.widget.deleteMany({
      where: {
        pageId,
      },
    });

    // B4: Tạo lại widget mới
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
    // B5: Trả danh sách widget mới tạo
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
