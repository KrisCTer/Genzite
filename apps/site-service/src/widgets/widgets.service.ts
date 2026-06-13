import { Injectable } from '@nestjs/common';

@Injectable()
export class WidgetsService {
  async replaceWidgets(pageId: string, widgets: Array<{ type: string; contentConfig: Record<string, unknown>; sortOrder: number }>) {
    // TODO: Delete existing widgets, insert new ones via Prisma
    return { pageId, widgetCount: widgets.length };
  }
}
