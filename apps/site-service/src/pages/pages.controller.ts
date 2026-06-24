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

@Controller("sites/:siteId/pages")
export class PagesController {
  constructor(private readonly pagesService: PagesService) {}

  @Get()
  async findAll(
    @Param("siteId") siteId: string,
    @Headers("x-user-id") userId: string,
  ) {
    return this.pagesService.findBySiteId(siteId, userId);
  }

  @Post()
  async create(
    @Param("siteId") siteId: string,
    @Body()
    body: {
      title: string;
      slug: string;
    },
    @Headers("x-user-id") userId: string,
  ) {
    return this.pagesService.create(siteId, body, userId);
  }

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
