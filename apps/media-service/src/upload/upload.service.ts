import { Injectable, ConflictException, ForbiddenException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";
import { MediaProducer } from "../events/media.producer.js";

@Injectable()
export class UploadService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mediaProducer: MediaProducer,
  ) {}

  private readonly s3 = new S3Client({
    region: process.env.AWS_REGION,
    // Disable automatic checksum calculation.
    // AWS SDK v3 adds CRC32 checksums by default which causes SignatureDoesNotMatch
    // errors when the browser performs a direct PUT upload using a presigned URL.
    requestChecksumCalculation: 'WHEN_REQUIRED',
    responseChecksumValidation: 'WHEN_REQUIRED',
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
    const region = process.env.AWS_REGION || "us-east-1";
    return `https://${bucket}.s3.${region}.amazonaws.com/${s3Key}`;
  }

  async generatePresignedUrl(
    ownerId: string,
    filename: string,
    mimeType: string,
  ) {
    const s3Key = `uploads/${ownerId}/${uuidv4()}/${filename}`;

    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: s3Key,
      ContentType: mimeType,
    });

    const uploadUrl = await getSignedUrl(this.s3, command, {
      expiresIn: 300,
    });

    return {
      uploadUrl,
      s3Key,
    };
  }

  async confirmUpload(
    ownerId: string,
    dto: {
      s3Key: string;
      filename: string;
      mimeType: string;
      sizeBytes: number;
    },
  ) {
    if (!dto.s3Key.startsWith(`uploads/${ownerId}/`)) {
      throw new ForbiddenException("You can only confirm media files uploaded to your own directory prefix");
    }

    const existing = await this.prisma.mediaFile.findUnique({
      where: { s3Key: dto.s3Key },
    });

    if (existing) {
      throw new ConflictException("Media already confirmed");
    }

    const media = await this.prisma.mediaFile.create({
      data: {
        filename: dto.filename,
        s3Key: dto.s3Key,
        mimeType: dto.mimeType,
        sizeBytes: dto.sizeBytes,
        ownerId,
      },
    });

    await this.mediaProducer.emitMediaUploaded({
      mediaId: media.id,
      s3Key: media.s3Key,
      filename: media.filename,
      mimeType: media.mimeType,
      ownerId: media.ownerId,
    });

    return {
      ...media,
      url: this.getPublicUrl(media.s3Key),
    };
  }

  async deleteByS3Key(s3Key: string) {
    await this.s3.send(
      new DeleteObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: s3Key,
      }),
    );

    const existing = await this.prisma.mediaFile.findUnique({
      where: { s3Key },
    });

    if (existing) {
      await this.prisma.mediaFile.delete({
        where: { id: existing.id },
      });

      await this.mediaProducer.emitMediaDeleted({
        mediaId: existing.id,
        s3Key: existing.s3Key,
        ownerId: existing.ownerId,
      });
    }

    return { success: true, s3Key };
  }
}
