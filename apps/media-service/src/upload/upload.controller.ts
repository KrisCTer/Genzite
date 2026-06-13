import { Controller, Post, Body } from '@nestjs/common';
import { UploadService } from './upload.service.js';

@Controller('media')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('presigned-url')
  async getPresignedUrl(@Body() body: { filename: string; mimeType: string }) {
    return this.uploadService.generatePresignedUrl(body.filename, body.mimeType);
  }

  @Post('confirm')
  async confirmUpload(@Body() body: { s3Key: string; filename: string; mimeType: string; sizeBytes: number }) {
    return this.uploadService.confirmUpload(body);
  }
}
