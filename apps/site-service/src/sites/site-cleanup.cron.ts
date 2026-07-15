import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class SiteCleanupCron {
  private readonly logger = new Logger(SiteCleanupCron.name);

  constructor(
    private readonly prisma: PrismaService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCleanup() {
    this.logger.log("Starting site cleanup job...");

    // Find sites deleted more than 7 days ago
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    try {
      const softDeletedSites = await this.prisma.site.findMany({
        where: {
          isDeleted: true,
          deletedAt: {
            lt: sevenDaysAgo,
          },
        },
      });

      if (softDeletedSites.length === 0) {
        this.logger.log("No expired soft-deleted sites found.");
        return;
      }

      this.logger.log(`Found ${softDeletedSites.length} expired sites. Deleting permanently...`);

      for (const site of softDeletedSites) {
        // Delete the site
        // Note: Prisma cascade delete should handle pages and widgets if configured properly in schema
        await this.prisma.site.delete({
          where: { id: site.id }
        });
        this.logger.log(`Permanently deleted site: ${site.id}`);
      }

      this.logger.log("Site cleanup job completed successfully.");
    } catch (error) {
      this.logger.error("Error during site cleanup job:", error);
    }
  }
}
