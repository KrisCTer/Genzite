import { Controller, Put, Body, Param } from '@nestjs/common';
import { WidgetsService } from './widgets.service.js';

@Controller('sites/pages/:pageId/widgets')
export class WidgetsController {
  constructor(private readonly widgetsService: WidgetsService) {}

  @Put()
  async updateWidgets(@Param('pageId') pageId: string, @Body() body: { widgets: Array<{ type: string; contentConfig: Record<string, unknown>; sortOrder: number }> }) {
    return this.widgetsService.replaceWidgets(pageId, body.widgets);
  }
}
