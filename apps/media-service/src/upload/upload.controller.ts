import {
  Controller,
  Post,
  Get,
  Query,
  Body,
  Headers,
  BadRequestException,
} from "@nestjs/common";
import { UploadService } from "./upload.service.js";

@Controller("media")
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Get("upload/presigned-url")
  async getPresignedUrlGet(
    @Query("fileName") fileName: string,
    @Query("fileType") fileType: string,
  ) {
    if (!fileName || !fileType) {
      throw new BadRequestException("fileName and fileType query parameters are required");
    }
    return this.uploadService.getPresignedUrl(fileName, fileType);
  }

  @Post("presigned-url")
  async getPresignedUrl(
    @Headers("x-user-id") ownerId: string,

    @Body()
    body: {
      filename: string;
      mimeType: string;
    },
  ) {
    // Every request must contain x-user-id.
    if (!ownerId) {
      throw new BadRequestException("x-user-id header is required");
    }

    return this.uploadService.generatePresignedUrl(
      ownerId,
      body.filename,
      body.mimeType,
    );
  }

  @Post("confirm")
  async confirmUpload(
    @Headers("x-user-id") ownerId: string,

    @Body()
    body: {
      s3Key: string;
      filename: string;
      mimeType: string;
      sizeBytes: number;
    },
  ) {
    if (!ownerId) {
      throw new BadRequestException("x-user-id header is required");
    }

    return this.uploadService.confirmUpload(ownerId, body);
  }
}
