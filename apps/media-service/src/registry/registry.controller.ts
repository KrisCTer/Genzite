import { Controller, Get } from '@nestjs/common';
import { RegistryService } from './registry.service.js';

@Controller('media')
export class RegistryController {
  constructor(private readonly registryService: RegistryService) {}

  @Get()
  async findAll() {
    // TODO: Filter by authenticated user
    return this.registryService.findByOwnerId('placeholder-user-id');
  }
}
