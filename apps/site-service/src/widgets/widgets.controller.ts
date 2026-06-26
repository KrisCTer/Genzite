import { Controller, Put, Body, Param, Headers, Get } from "@nestjs/common";
import { WidgetsService } from "./widgets.service.js";

@Controller("sites/pages/:pageId/widgets")
export class WidgetsController {
  constructor(private readonly widgetsService: WidgetsService) {}

  @Get()
  async findWidgets(
    @Param("pageId") pageId: string,
    @Headers("x-user-id") userId: string,
  ) {
    return this.widgetsService.findByPageId(pageId, userId);
  }
  @Put()
  async updateWidgets(
    @Param("pageId") pageId: string,

    // Body contains the list of new widgets
    @Body()
    body: {
      widgets: Array<{
        type: string;
        contentConfig: Record<string, unknown>;
        sortOrder: number;
      }>;
    },

    // Header identifies current user
    @Headers("x-user-id")
    userId: string,
  ) {
    return this.widgetsService.replaceWidgets(pageId, body.widgets, userId);
  }
}
