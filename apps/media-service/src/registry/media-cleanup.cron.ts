import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { PrismaService } from "../prisma/prisma.service.js";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";

@Injectable()
export class MediaCleanupCron {
  private readonly logger = new Logger(MediaCleanupCron.name);
  private readonly s3 = new S3Client({
    region: process.env.AWS_REGION,
  });

  constructor(private readonly prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCleanup() {
    this.logger.log("Starting media cleanup job...");

    // Find files deleted more than 7 days ago
    const expiredTime = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    const softDeletedFiles = await this.prisma.mediaFile.findMany({
      where: {
        isDeleted: true,
        deletedAt: {
          lt: expiredTime,
        },
      },
      take: 50, // Batch limit
    });

    if (softDeletedFiles.length === 0) {
      this.logger.log("No soft-deleted files found to process.");
      return;
    }

    this.logger.log(`Found ${softDeletedFiles.length} files to check dependencies.`);

    for (const file of softDeletedFiles) {
      try {
        const siteServiceUrl = process.env.SITE_SERVICE_URL || "http://localhost:3002";
        const response = await fetch(`${siteServiceUrl}/internal/sites/dependency?s3Key=${encodeURIComponent(file.s3Key)}`);
        
        if (!response.ok) {
          this.logger.warn(`Failed to check dependency for ${file.s3Key}: ${response.statusText}`);
          continue;
        }

        const data = await response.json();
        
        if (data.isUsed) {
          this.logger.log(`File ${file.s3Key} is STILL IN USE. Restoring file (undelete).`);
          await this.prisma.mediaFile.update({
            where: { id: file.id },
            data: { isDeleted: false, deletedAt: null },
          });
        } else {
          this.logger.log(`File ${file.s3Key} is NOT used. Deleting permanently.`);
          
          // 1. Delete from S3
          await this.s3.send(
            new DeleteObjectCommand({
              Bucket: process.env.AWS_S3_BUCKET || "genzite-media-dev",
              Key: file.s3Key,
            }),
          );

          // 2. Delete from Database
          await this.prisma.mediaFile.delete({
            where: { id: file.id },
          });
        }
      } catch (error) {
        this.logger.error(`Error processing file ${file.s3Key}:`, error);
      }
    }
    
    this.logger.log("Media cleanup job completed.");
  }
}
