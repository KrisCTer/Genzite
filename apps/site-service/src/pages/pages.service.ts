import {
  Injectable,
  ConflictException,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";

import { PrismaService } from "../prisma/prisma.service";
import { SiteProducer } from "src/events/site.producer";

@Injectable()
export class PagesService {
  constructor(
    private prisma: PrismaService,
    private readonly siteProducer: SiteProducer,
  ) {}

  private async verifySiteOwnership(siteId: string, userId: string) {
    const site = await this.prisma.site.findUnique({
      where: {
        id: siteId,
      },
    });

    if (!site) {
      throw new NotFoundException("Site not found");
    }

    if (site.ownerId !== userId) {
      throw new ForbiddenException("You do not own this site");
    }

    return site;
  }

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

  async findBySiteId(siteId: string, userId: string) {
    await this.verifySiteOwnership(siteId, userId);
    // TODO: Query DB via Prisma
    return this.prisma.page.findMany({
      where: {
        siteId,
      },
      orderBy: {
        sortOrder: "asc",
      },
    });
  }

  async create(
    siteId: string,
    dto: {
      title: string;
      slug: string;
    },
    userId: string,
  ) {
    // B1: Kiểm tra user có quyền với site
    await this.verifySiteOwnership(siteId, userId);

    // B2: Kiểm tra slug trùng trong site
    const existed = await this.prisma.page.findFirst({
      where: {
        siteId,
        slug: dto.slug,
      },
    });

    if (existed) {
      throw new ConflictException("Slug already exists");
    }

    // B3: Lấy page cuối cùng của site
    const lastPage = await this.prisma.page.findFirst({
      where: {
        siteId,
      },
      orderBy: {
        sortOrder: "desc",
      },
    });

    // B4: Tính sortOrder tiếp theo
    const nextSortOrder = (lastPage?.sortOrder ?? -1) + 1;

    // B5: Tạo page
    return this.prisma.page.create({
      data: {
        title: dto.title,
        slug: dto.slug,
        siteId,
        sortOrder: nextSortOrder,
      },
    });
  }

  async update(
    pageId: string,
    dto: {
      title?: string;
      slug?: string;
      sortOrder?: number;
    },
    userId: string,
  ) {
    // B1: Check quyền
    const page = await this.verifyPageOwnership(pageId, userId);

    // B2: Check slug trùng
    if (dto.slug) {
      const existed = await this.prisma.page.findFirst({
        where: {
          siteId: page.siteId,
          slug: dto.slug,
        },
      });

      if (existed && existed.id !== pageId) {
        throw new ConflictException("Slug already exists");
      }
    }

    // B3: Update page
    const updatedPage = await this.prisma.page.update({
      where: {
        id: pageId,
      },
      data: {
        title: dto.title,
        slug: dto.slug,
        sortOrder: dto.sortOrder,
      },
    });

    // B4: Emit Kafka event
    await this.siteProducer.emitPageUpdated({
      pageId: updatedPage.id,
      siteId: updatedPage.siteId,
      title: updatedPage.title,
    });

    // B5: Trả kết quả
    return updatedPage;
  }

  async delete(pageId: string, userId: string) {
    await this.verifyPageOwnership(pageId, userId);

    return this.prisma.page.delete({
      where: {
        id: pageId,
      },
    });
  }
}
