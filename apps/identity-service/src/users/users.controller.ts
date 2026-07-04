import { Controller, Get, Param, UseGuards, Req, Post, Body, Headers, ForbiddenException } from '@nestjs/common';
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

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  // --- INTERNAL ENDPOINTS FOR MICROSERVICES ---
  @Post('internal/:id/deduct-credits')
  async deductCredits(
    @Headers('x-internal-token') internalToken: string,
    @Param('id') id: string,
    @Body('amount') amount: number
  ) {
    if (internalToken !== (process.env.INTERNAL_SERVICE_TOKEN || 'dev-internal-token')) {
      throw new ForbiddenException('Invalid internal service token');
    }
    return this.usersService.deductCredits(id, amount);
  }

  @Post('internal/:id/refund-credits')
  async refundCredits(
    @Headers('x-internal-token') internalToken: string,
    @Param('id') id: string,
    @Body('amount') amount: number
  ) {
    if (internalToken !== (process.env.INTERNAL_SERVICE_TOKEN || 'dev-internal-token')) {
      throw new ForbiddenException('Invalid internal service token');
    }
    return this.usersService.refundCredits(id, amount);
  }
}
