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

  async findByOwnerId(ownerId: string, page: number, limit: number) {
    // Calculate offset for pagination.
    const skip = (page - 1) * limit;

    return this.prisma.mediaFile.findMany({
      where: {
        ownerId,
      },

      orderBy: {
        createdAt: "desc",
      },

      skip,
      take: limit,
    });
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

    // Delete file from S3.
    // This requires valid AWS credentials and a real bucket.
    await this.s3.send(
      new DeleteObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: media.s3Key,
      }),
    );

    // Delete metadata record from PostgreSQL.
    await this.prisma.mediaFile.delete({
      where: {
        id: mediaId,
      },
    });

    // Notify other services that this media has been deleted.
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
}
