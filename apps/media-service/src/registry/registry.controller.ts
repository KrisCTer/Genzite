import {
  Controller,
  Get,
  Headers,
  Query,
  BadRequestException,
  Delete,
  Param,
} from "@nestjs/common";
import { RegistryService } from "./registry.service.js";

@Controller("media")
export class RegistryController {
  constructor(private readonly registryService: RegistryService) {}
  @Get()
  async findAll(
    @Headers("x-user-id") ownerId: string,
    @Query("page") page = "1",
    @Query("limit") limit = "20",
  ) {
    // Every request must contain x-user-id.
    if (!ownerId) {
      throw new BadRequestException("x-user-id header is required");
    }

    return this.registryService.findByOwnerId(
      ownerId,
      Number(page),
      Number(limit),
    );
  }

  @Delete(":mediaId")
  async deleteMedia(
    // User identity comes from API Gateway / Auth Service.
    @Headers("x-user-id") ownerId: string,

    @Param("mediaId") mediaId: string,
  ) {
    if (!ownerId) {
      throw new BadRequestException("x-user-id header is required");
    }

    return this.registryService.deleteMedia(mediaId, ownerId);
  }
}
