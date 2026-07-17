import {
  Injectable,
  ConflictException,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from "@nestjs/common";

import { PrismaService } from "../prisma/prisma.service";
import { SiteProducer } from "../events/site.producer.js";

@Injectable()
export class PagesService {
  constructor(
    private prisma: PrismaService,
    private readonly siteProducer: SiteProducer,
  ) { }

  async findBySiteId(siteId: string, userId: string, userEmail?: string) {
    try {
      const site = await this.verifySiteOwnership(siteId, userId, true, userEmail);

      return await this.prisma.page.findMany({
        where: {
          siteId: site.id,
        },
        orderBy: {
          sortOrder: "asc",
        },
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        if (siteId && (siteId.startsWith('gen-') || siteId.startsWith('new-'))) {
          return [];
        }
        throw new BadRequestException("Site not found (Bypassing CloudFront 404)");
      }
      throw error;
    }
  }

  private async verifySiteOwnership(siteIdOrSubdomain: string, userId: string, allowPublicRead: boolean = false, userEmail?: string) {
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(siteIdOrSubdomain);
    const site = await this.prisma.site.findFirst({
      where: isUUID ? { id: siteIdOrSubdomain } : { subdomain: siteIdOrSubdomain },
    });

    if (!site) {
      throw new NotFoundException("Site not found");
    }

    const isPublic = (site.settings as any)?.shareAccess === 'Public: Anyone with the link can view';
    const isRestricted = (site.settings as any)?.shareAccess === 'Restricted: Only people you specify can access';
    const sharedEmails = (site.settings as any)?.sharedEmails || [];
    const isSharedWithUser = userEmail && sharedEmails.includes(userEmail);

    if (allowPublicRead) {
      if (site.ownerId !== userId && !isPublic && !isSharedWithUser) {
        throw new ForbiddenException("You do not own this site and it is not shared with you");
      }
    } else {
      if (site.ownerId !== userId && !isSharedWithUser) {
        throw new ForbiddenException("You do not own this site and you are not a collaborator");
      }
    }

    return site;
  }

  private async verifyPageOwnership(pageId: string, userId: string, userEmail?: string) {
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

    const isRestricted = (page.site.settings as any)?.shareAccess === 'Restricted: Only people you specify can access';
    const sharedEmails = (page.site.settings as any)?.sharedEmails || [];
    const isSharedWithUser = userEmail && sharedEmails.includes(userEmail);

    if (page.site.ownerId !== userId && !isSharedWithUser) {
      throw new ForbiddenException("You do not own this page and you are not a collaborator");
    }
    return page;
  }



  async findById(id: string, siteId: string, userId: string, userEmail?: string) {
    const site = await this.verifySiteOwnership(siteId, userId, true, userEmail);

    return this.prisma.page.findFirst({
      where: {
        id,
        siteId: site.id,
      },
    });
  }

  async findBySlug(siteId: string, slug: string, userId: string, userEmail?: string) {
    const site = await this.verifySiteOwnership(siteId, userId, true, userEmail);

    return this.prisma.page.findFirst({
      where: {
        siteId: site.id,
        slug,
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
    // Step 1: Check if user has permission for the site
    const site = await this.verifySiteOwnership(siteId, userId);

    // Step 2: Check for duplicate slug in the site
    const existed = await this.prisma.page.findFirst({
      where: {
        siteId: site.id,
        slug: dto.slug,
      },
    });

    if (existed) {
      throw new ConflictException("Slug already exists");
    }

    // Step 3: Get the last page of the site
    const lastPage = await this.prisma.page.findFirst({
      where: {
        siteId: site.id,
      },
      orderBy: {
        sortOrder: "desc",
      },
    });

    // Step 4: Calculate the next sortOrder
    const nextSortOrder = (lastPage?.sortOrder ?? -1) + 1;

    // Step 5: Create the page
    return this.prisma.page.create({
      data: {
        title: dto.title,
        slug: dto.slug,
        siteId: site.id,
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
    // Step 1: Check permissions
    const page = await this.verifyPageOwnership(pageId, userId);

    // Step 2: Check duplicate slug
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

    // Step 5: Return result
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
