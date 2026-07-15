import { Controller, Get, Put, Body, Param, UseGuards, HttpException, HttpStatus } from '@nestjs/common';
import { SettingsService } from './settings.service.js';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('public')
  async getPublic() {
    return this.settingsService.getPublicSettings();
  }

  @Get()
  async getAll() {
    return this.settingsService.getAllSettings();
  }

  @Put(':key')
  async updateSetting(@Param('key') key: string, @Body() body: { value: any }) {
    if (body.value === undefined) {
      throw new HttpException('Value is required', HttpStatus.BAD_REQUEST);
    }
    return this.settingsService.updateSetting(key, body.value);
  }
}
