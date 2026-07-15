import { Controller, Get, Query } from "@nestjs/common";
import { SitesService } from "./sites.service.js";

@Controller("internal/sites")
export class SitesInternalController {
  constructor(private readonly sitesService: SitesService) {}

  @Get("dependency")
  async checkDependency(@Query("s3Key") s3Key: string) {
    const isUsed = await this.sitesService.checkDependency(s3Key);
    return { isUsed };
  }
}
