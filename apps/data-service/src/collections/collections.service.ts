import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { Prisma } from '@prisma/client-data';
import { DataProducer } from '../events/data.producer.js';
import { CreateCollectionDto, UpdateCollectionDto } from './dto/create-collection.dto.js';
import { toSlug } from '@genzite/shared-utils';

@Injectable()
export class CollectionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly dataProducer: DataProducer,
  ) {}

  /** 4.4 — Create a new collection */
  async create(dto: CreateCollectionDto, userId: string) {
    const slug = toSlug(dto.name);

    // Check for duplicate slug within the same site
    const existing = await this.prisma.cmsCollection.findUnique({
      where: { siteId_slug: { siteId: dto.siteId, slug } },
    });

    if (existing) {
      throw new ConflictException(
        `Collection with name '${dto.name}' already exists in this site`,
      );
    }

    const collection = await this.prisma.cmsCollection.create({
      data: {
        siteId: dto.siteId,
        name: dto.name,
        slug,
        schemaDefinition: dto.schemaDefinition as Prisma.InputJsonValue,
      },
    });

    // Emit Kafka event
    await this.dataProducer.emitCollectionCreated({
      collectionId: collection.id,
      siteId: collection.siteId,
      name: collection.name,
    });

    return collection;
  }

  /** 4.5 — List collections by siteId */
  async findBySiteId(siteId: string) {
    return this.prisma.cmsCollection.findMany({
      where: { siteId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /** 4.6 — Get collection by ID */
  async findById(collectionId: string) {
    const collection = await this.prisma.cmsCollection.findUnique({
      where: { id: collectionId },
    });

    if (!collection) {
      throw new NotFoundException(`Collection '${collectionId}' not found`);
    }

    return collection;
  }

  /** 4.7 — Update collection (name and/or schemaDefinition) */
  async update(collectionId: string, dto: UpdateCollectionDto) {
    const collection = await this.findById(collectionId);
    const updateData: any = {};

    if (dto.name !== undefined) {
      const slug = toSlug(dto.name);
      
      const existing = await this.prisma.cmsCollection.findUnique({
        where: { siteId_slug: { siteId: collection.siteId, slug } },
      });

      if (existing && existing.id !== collectionId) {
        throw new ConflictException(
          `Collection with name '${dto.name}' already exists in this site`,
        );
      }

      updateData.name = dto.name;
      updateData.slug = slug;
    }

    if (dto.schemaDefinition !== undefined) {
      updateData.schemaDefinition = dto.schemaDefinition as Prisma.InputJsonValue;
    }

    const updated = await this.prisma.cmsCollection.update({
      where: { id: collectionId },
      data: updateData,
    });

    // Emit Kafka event
    await this.dataProducer.emitCollectionUpdated({
      collectionId: updated.id,
      siteId: updated.siteId,
      name: updated.name,
    });

    return updated;
  }

  /** 4.8 — Delete collection (cascade deletes records via Prisma relation onDelete: Cascade) */
  async remove(collectionId: string) {
    // Verify collection exists
    const collection = await this.findById(collectionId);

    await this.prisma.cmsCollection.delete({
      where: { id: collectionId },
    });

    // Emit Kafka event
    await this.dataProducer.emitCollectionDeleted({
      collectionId,
      siteId: collection.siteId,
    });

    return { deleted: true, id: collectionId };
  }
}
