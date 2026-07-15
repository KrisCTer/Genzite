import {
  Injectable,
  ConflictException,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { SiteProducer } from "../events/site.producer.js";
@Injectable()
export class SitesService {
  constructor(
    private prisma: PrismaService,
    private readonly siteProducer: SiteProducer,
  ) {}

  async findAll(userId: string) {
    return this.prisma.site.findMany({
      where: {
        ownerId: userId,
        isDeleted: false,
      },
    });
  }

  async checkDependency(s3Key: string): Promise<boolean> {
    if (!s3Key) return false;
    
    // Perform a raw query to check if the s3Key is present in any content_config JSON
    const result = await this.prisma.$queryRaw<{id: string}[]>`
      SELECT id FROM site.widgets 
      WHERE content_config::text LIKE ${'%' + s3Key + '%'}
      LIMIT 1
    `;
    
    return result.length > 0;
  }

  async findById(idOrSubdomain: string, userId: string, userEmail?: string) {
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSubdomain);
    const site = await this.prisma.site.findFirst({
      where: isUUID 
        ? { id: idOrSubdomain, isDeleted: false } 
        : { subdomain: idOrSubdomain, isDeleted: false },
    });

    if (!site) {
      throw new NotFoundException("Site not found");
    }

    const isPublic = (site.settings as any)?.shareAccess === 'Public: Anyone with the link can view';
    const isRestricted = (site.settings as any)?.shareAccess === 'Restricted: Only people you specify can access';
    const sharedEmails = (site.settings as any)?.sharedEmails || [];
    const isSharedWithUser = isRestricted && userEmail && sharedEmails.includes(userEmail);

    if (site.ownerId !== userId && !isPublic && !isSharedWithUser) {
      throw new ForbiddenException("You do not own this site and it is not shared with you");
    }

    return site;
  }

  async findBySubdomainWithDetails(subdomain: string, userId: string, userEmail?: string) {
    const site = await this.prisma.site.findFirst({
      where: { subdomain, isDeleted: false },
      include: {
        pages: {
          include: {
            widgets: {
              orderBy: { sortOrder: 'asc' }
            }
          },
          orderBy: { sortOrder: 'asc' }
        }
      }
    });

    if (!site) {
      throw new NotFoundException("Site not found");
    }

    const isPublic = (site.settings as any)?.shareAccess === 'Public: Anyone with the link can view';
    const isRestricted = (site.settings as any)?.shareAccess === 'Restricted: Only people you specify can access';
    const sharedEmails = (site.settings as any)?.sharedEmails || [];
    const isSharedWithUser = isRestricted && userEmail && sharedEmails.includes(userEmail);

    if (site.ownerId !== userId && !isPublic && !isSharedWithUser) {
      throw new ForbiddenException("You do not own this site and it is not shared with you");
    }

    return site;
  }

  async create(
    dto: {
      id?: string;
      name: string;
      subdomain: string;
      description?: string;
      settings?: any;
    },
    userId: string,
  ) {
    const existed = await this.prisma.site.findUnique({
      where: {
        subdomain: dto.subdomain,
      },
    });

    if (existed) {
      throw new ConflictException("Subdomain already exists");
    }
    // Step 1: Create site
    const site = await this.prisma.site.create({
      data: {
        ...(dto.id ? { id: dto.id } : {}),
        name: dto.name,
        subdomain: dto.subdomain,
        description: dto.description,
        settings: dto.settings,
        ownerId: userId,
      },
    });

    // B2: Emit Kafka event
    await this.siteProducer.emitSiteCreated({
      siteId: site.id,
      name: site.name,
      subdomain: site.subdomain,
      ownerId: site.ownerId,
    });

    // Step 3: Return result
    return site;
  }

  async update(
    id: string,
    dto: {
      name?: string;
      subdomain?: string;
      description?: string;
      isPublished?: boolean;
      settings?: any;
    },
    userId: string,
    userEmail?: string,
  ) {
    const existingSite = await this.findById(id, userId);
    if (dto.subdomain) {
      const existed = await this.prisma.site.findUnique({
        where: {
          subdomain: dto.subdomain,
        },
      });

      if (existed && existed.id !== id) {
        throw new ConflictException("Subdomain already exists");
      }
    }

    // Check for newly invited emails
    if (dto.settings && dto.settings.sharedEmails) {
      const oldEmails: string[] = (existingSite.settings as any)?.sharedEmails || [];
      const newEmails: string[] = dto.settings.sharedEmails || [];
      const addedEmails = newEmails.filter(e => !oldEmails.includes(e));

      for (const email of addedEmails) {
        await this.siteProducer.emitSiteInvited({
          siteId: id,
          siteName: dto.name || existingSite.name,
          inviterEmail: userEmail || userId,
          invitedEmail: email,
        });
      }
    }

    return this.prisma.site.update({
      where: {
        id,
      },
      data: {
        name: dto.name,
        subdomain: dto.subdomain,
        description: dto.description,
        isPublished: dto.isPublished,
        settings: dto.settings,
      },
    });
  }

  async delete(id: string, userId: string) {
    await this.findById(id, userId);

    return this.prisma.site.update({
      where: {
        id,
      },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      }
    });
  }

  async duplicate(idOrSubdomain: string, userId: string) {
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSubdomain);
    const site = await this.prisma.site.findFirst({
      where: isUUID 
        ? { id: idOrSubdomain, isDeleted: false } 
        : { subdomain: idOrSubdomain, isDeleted: false },
      include: {
        pages: {
          include: {
            widgets: {
              orderBy: { sortOrder: 'asc' },
            },
          },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    if (!site) {
      throw new NotFoundException("Site not found");
    }

    if (site.ownerId !== userId) {
      throw new ForbiddenException("You do not own this site");
    }

    const timestamp = Date.now();
    const newName = `${site.name} (Copy)`;
    const newSubdomain = `${site.subdomain}-copy-${timestamp}`;

    const duplicatedSite = await this.prisma.site.create({
      data: {
        name: newName,
        subdomain: newSubdomain,
        description: site.description,
        settings: site.settings === null ? {} : (site.settings as any),
        ownerId: userId,
        isPublished: false,
        pages: {
          create: site.pages.map((page) => ({
            title: page.title,
            slug: page.slug,
            description: page.description,
            sortOrder: page.sortOrder,
            isPublished: false,
            widgets: {
              create: page.widgets.map((widget) => ({
                type: widget.type,
                contentConfig: widget.contentConfig === null ? {} : (widget.contentConfig as any),
                sortOrder: widget.sortOrder,
              })),
            },
          })),
        },
      },
      include: {
        pages: {
          include: {
            widgets: true,
          },
        },
      },
    });

    await this.siteProducer.emitSiteCreated({
      siteId: duplicatedSite.id,
      name: duplicatedSite.name,
      subdomain: duplicatedSite.subdomain,
      ownerId: duplicatedSite.ownerId,
    });

    return duplicatedSite;
  }

  // --- FEEDBACK ---
  async submitFeedback(body: { siteId?: string; text: string }, userEmail: string) {
    await this.siteProducer.emitFeedbackSubmitted({
      siteId: body.siteId,
      text: body.text,
      userEmail,
    });
  }

  // --- INTERNAL ENDPOINTS ---
  async getInternalConfig(siteId: string) {
    const site = await this.prisma.site.findUnique({
      where: { id: siteId },
      select: { ownerId: true, settings: true },
    });
    if (!site) throw new NotFoundException('Site not found');
    return site;
  }

  async getInternalProducts(siteId: string) {
    const pages = await this.prisma.page.findMany({
      where: { siteId },
      include: {
        widgets: {
          where: { type: { in: ['PRODUCT_GRID', 'product_grid'] } },
        },
      },
    });

    const products: any[] = [];
    for (const page of pages) {
      for (const widget of page.widgets) {
        const config = widget.contentConfig;
        if (
          config &&
          typeof config === 'object' &&
          !Array.isArray(config) &&
          'products' in config &&
          Array.isArray(config.products)
        ) {
          products.push(...config.products);
        }
      }
    }
    return products;
  }

  async findTrash(userId: string) {
    return this.prisma.site.findMany({
      where: {
        ownerId: userId,
        isDeleted: true,
      },
    });
  }

  async restore(id: string, userId: string) {
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    const site = await this.prisma.site.findFirst({
      where: isUUID 
        ? { id: id, isDeleted: true } 
        : { subdomain: id, isDeleted: true },
    });

    if (!site) {
      throw new NotFoundException("Site not found in trash");
    }

    if (site.ownerId !== userId) {
      throw new ForbiddenException("You do not own this site");
    }

    return this.prisma.site.update({
      where: {
        id: site.id,
      },
      data: {
        isDeleted: false,
        deletedAt: null,
      },
    });
  }

  async checkSubdomainAvailability(subdomain: string, excludeSiteId?: string): Promise<{ available: boolean }> {
    const existing = await this.prisma.site.findUnique({
      where: { subdomain },
    });
    
    if (existing && existing.id !== excludeSiteId) {
      return { available: false };
    }
    return { available: true };
  }
}
