import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";

import { PrismaService } from "../prisma/prisma.service.js";

import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { MediaProducer } from "../events/media.producer.js";

@Injectable()
export class RegistryService {
  constructor(
    // Prisma is used to query and modify media metadata.
    private readonly prisma: PrismaService,

    // Publish media events to Kafka.
    private readonly mediaProducer: MediaProducer,
  ) {}

  private readonly s3 = new S3Client({
    // AWS region used to access S3 bucket.
    region: process.env.AWS_REGION,
  });

  private getPublicUrl(s3Key: string): string {
    if (!s3Key) return "";
    if (s3Key.startsWith("http://") || s3Key.startsWith("https://")) {
      return s3Key;
    }
    const bucket = process.env.AWS_S3_BUCKET || "genzite-media-dev";
    const endpoint = process.env.AWS_ENDPOINT;
    if (endpoint) {
      return `${endpoint.replace(/\/$/, "")}/${bucket}/${s3Key}`;
    }
    const region = process.env.AWS_REGION || "ap-southeast-1";
    return `https://${bucket}.s3.${region}.amazonaws.com/${s3Key}`;
  }

  async findByOwnerId(ownerId: string, page: number, limit: number) {
    // Calculate offset for pagination.
    const skip = (page - 1) * limit;

    const records = await this.prisma.mediaFile.findMany({
      where: {
        ownerId,
        isDeleted: false, // Filter out soft-deleted files
      },

      orderBy: {
        createdAt: "desc",
      },

      skip,
      take: limit,
    });

    return records.map((record) => ({
      ...record,
      url: this.getPublicUrl(record.s3Key),
    }));
  }

  async deleteMedia(mediaId: string, ownerId: string) {
    // Find media record by id.
    const media = await this.prisma.mediaFile.findUnique({
      where: {
        id: mediaId,
      },
    });

    // Return 404 if media does not exist.
    if (!media) {
      throw new NotFoundException("Media not found");
    }

    // Prevent users from deleting files they do not own.
    if (media.ownerId !== ownerId) {
      throw new ForbiddenException("Access denied");
    }

    // Soft delete: Do NOT delete from S3 yet.
    // The cron job will handle actual deletion later if not used.

    // Update metadata record in PostgreSQL to soft-deleted.
    await this.prisma.mediaFile.update({
      where: {
        id: mediaId,
      },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });

    // Notify other services that this media has been soft-deleted (optional).
    await this.mediaProducer.emitMediaDeleted({
      mediaId: media.id,
      s3Key: media.s3Key,
      ownerId: media.ownerId,
    });
    return {
      message: "Media deleted successfully",
      mediaId,
    };
  }

  async findTrash(ownerId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;

    const records = await this.prisma.mediaFile.findMany({
      where: {
        ownerId,
        isDeleted: true,
      },
      orderBy: {
        deletedAt: "desc",
      },
      skip,
      take: limit,
    });

    return records.map((record) => ({
      ...record,
      url: this.getPublicUrl(record.s3Key),
    }));
  }

  async restoreMedia(mediaId: string, ownerId: string) {
    const media = await this.prisma.mediaFile.findUnique({
      where: {
        id: mediaId,
      },
    });

    if (!media) {
      throw new NotFoundException("Media not found in trash");
    }

    if (media.ownerId !== ownerId) {
      throw new ForbiddenException("Access denied");
    }

    await this.prisma.mediaFile.update({
      where: {
        id: mediaId,
      },
      data: {
        isDeleted: false,
        deletedAt: null,
      },
    });

    return {
      message: "Media restored successfully",
      mediaId,
    };
  }
}
