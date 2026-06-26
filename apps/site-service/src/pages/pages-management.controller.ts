import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Headers,
  Put,
  Delete,
} from "@nestjs/common";
import { PagesService } from "./pages.service.js";

@Controller("sites/pages")
export class PagesManagementController {
  constructor(private readonly pagesService: PagesService) {}

  @Put(":pageId")
  async update(
    @Param("pageId") pageId: string,
    @Body()
    body: {
      title?: string;
      slug?: string;
      sortOrder?: number;
    },
    @Headers("x-user-id") userId: string,
  ) {
    return this.pagesService.update(pageId, body, userId);
  }

  @Delete(":pageId")
  async delete(
    @Param("pageId") pageId: string,
    @Headers("x-user-id") userId: string,
  ) {
    return this.pagesService.delete(pageId, userId);
  }
}
