import { Injectable, ConflictException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";
import { MediaProducer } from "../events/media.producer.js";

@Injectable()
export class UploadService {
  constructor(
    // Prisma is used to manage media metadata.
    private readonly prisma: PrismaService,

    // Publish media events to Kafka.
    private readonly mediaProducer: MediaProducer,
  ) {}
  private readonly s3 = new S3Client({
    // AWS region used to access S3.
    region: process.env.AWS_REGION,
  });
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
    // Check file confirmed or not by s3Key
    const existing = await this.prisma.mediaFile.findUnique({
      where: {
        s3Key: dto.s3Key,
      },
    });

    // confirm upload file, if existing => throw ConflictException
    if (existing) {
      throw new ConflictException("Media already confirmed");
    }

    // Save media file to database
    const media = await this.prisma.mediaFile.create({
      data: {
        filename: dto.filename,
        s3Key: dto.s3Key,
        mimeType: dto.mimeType,
        sizeBytes: dto.sizeBytes,
        ownerId,
      },
    });
    // Notify other services that a media file has been uploaded.
    await this.mediaProducer.emitMediaUploaded({
      mediaId: media.id,
      s3Key: media.s3Key,
      filename: media.filename,
      mimeType: media.mimeType,
      ownerId: media.ownerId,
    });
    return media;
  }
}
