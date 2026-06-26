import {
  Injectable,
  ConflictException,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { SiteProducer } from "src/events/site.producer";
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
      },
    });
  }

  async findById(id: string, userId: string) {
    const site = await this.prisma.site.findUnique({
      where: {
        id,
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

  async create(
    dto: {
      name: string;
      subdomain: string;
      description?: string;
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
    // B1: Tạo site
    const site = await this.prisma.site.create({
      data: {
        name: dto.name,
        subdomain: dto.subdomain,
        description: dto.description,
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

    // B3: Trả kết quả
    return site;
  }

  async update(
    id: string,
    dto: {
      name?: string;
      subdomain?: string;
      settings?: any;
    },
    userId: string,
  ) {
    await this.findById(id, userId);
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
    return this.prisma.site.update({
      where: {
        id,
      },
      data: {
        name: dto.name,
        subdomain: dto.subdomain,
        settings: dto.settings,
      },
    });
  }

  async delete(id: string, userId: string) {
    await this.findById(id, userId);

    return this.prisma.site.delete({
      where: {
        id,
      },
    });
  }
}
