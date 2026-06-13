import { Module } from '@nestjs/common';
import { UploadController } from './upload/upload.controller.js';
import { UploadService } from './upload/upload.service.js';
import { RegistryController } from './registry/registry.controller.js';
import { RegistryService } from './registry/registry.service.js';

@Module({
  imports: [],
  controllers: [UploadController, RegistryController],
  providers: [UploadService, RegistryService],
})
export class AppModule {}
