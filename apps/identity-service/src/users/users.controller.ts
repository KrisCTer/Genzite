import { Controller, Get, Param, UseGuards, Req, Post, Body } from '@nestjs/common';
import { UsersService } from './users.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@Req() req: any) {
    const userId = req.user.sub;
    return this.usersService.findById(userId);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  // --- INTERNAL ENDPOINTS FOR MICROSERVICES ---
  @Post('internal/:id/deduct-credits')
  async deductCredits(
    @Param('id') id: string,
    @Body('amount') amount: number
  ) {
    return this.usersService.deductCredits(id, amount);
  }
}
