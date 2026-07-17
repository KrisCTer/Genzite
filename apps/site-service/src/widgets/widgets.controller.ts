import { Controller, Put, Body, Param, Headers, Get } from "@nestjs/common";
import { WidgetsService } from "./widgets.service.js";
import { WidgetValidationPipe } from "./pipes/widget-validation.pipe.js";

@Controller("sites/pages/:pageId/widgets")
export class WidgetsController {
  constructor(private readonly widgetsService: WidgetsService) {}

  @Get('public')
  async findWidgetsPublic(
    @Param('pageId') pageId: string,
  ) {
    return this.widgetsService.findByPageIdPublic(pageId);
  }

  @Get()
  async findWidgets(
    @Param("pageId") pageId: string,
    @Headers("x-user-id") userId: string,
    @Headers("x-user-email") userEmail?: string,
  ) {
    return this.widgetsService.findByPageId(pageId, userId, userEmail);
  }
  
  @Put()
  async updateWidgets(
    @Param("pageId") pageId: string,
    @Body(new WidgetValidationPipe())
    body: {
      widgets: Array<{
        type: string;
        contentConfig: Record<string, unknown>;
        sortOrder: number;
      }>;
    },
    @Headers("x-user-id") userId: string,
    @Headers("x-user-email") userEmail?: string,
  ) {
    return this.widgetsService.replaceWidgets(pageId, body.widgets, userId, userEmail);
  }
}
