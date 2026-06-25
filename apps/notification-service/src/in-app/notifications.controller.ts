import { Controller, Get, Put, Param, Headers, Query } from "@nestjs/common";
import { NotificationsService } from "./notifications.service.js";

@Controller("notifications")
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async findAll(
    @Headers("x-user-id") userId: string,
    @Query("page") page?: string,
    @Query("limit") limit?: string,
    @Query("unreadOnly") unreadOnly?: string,
  ) {
    return this.notificationsService.findByUserId(
      userId,
      Number(page ?? 1),
      Number(limit ?? 20),
      unreadOnly === "true",
    );
  }

  @Put(":id/read")
  async markAsRead(
    @Headers("x-user-id") userId: string,
    @Param("id") id: string,
  ) {
    return this.notificationsService.markAsRead(id, userId);
  }
  @Put("read-all")
  async markAllAsRead(@Headers("x-user-id") userId: string) {
    return this.notificationsService.markAllAsRead(userId);
  }
}
