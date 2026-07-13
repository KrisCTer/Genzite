import {
  Controller,
  Post,
  Body,
  Headers,
  BadRequestException,
  ForbiddenException,
} from "@nestjs/common";
import { UploadService } from "./upload.service.js";

@Controller("media")
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

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

  @Post("internal/delete-by-key")
  async deleteByKey(
    @Headers("x-internal-token") internalToken: string,
    @Body("s3Key") s3Key: string,
  ) {
    if (internalToken !== process.env.INTERNAL_SERVICE_TOKEN) {
      throw new ForbiddenException("Invalid internal service token");
    }
    return this.uploadService.deleteByS3Key(s3Key);
  }
}
