import { Controller, Get, Param, UseGuards, Req, Post, Body, Headers, ForbiddenException, Delete } from '@nestjs/common';
import { UsersService } from './users.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';

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
  @Post('me') // fallback for clients not supporting PATCH well, or just use PATCH
  async updateProfileLegacy(@Req() req: any, @Body() body: any) {
    const userId = req.user.sub;
    return this.usersService.updateProfile(userId, body);
  }

  @UseGuards(JwtAuthGuard)
  @Post('me/update') // Alternative to PATCH
  async updateProfileAlternative(@Req() req: any, @Body() body: any) {
    const userId = req.user.sub;
    return this.usersService.updateProfile(userId, body);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get()
  async findAll(@Req() req: any) {
    // Admin only - requires RolesGuard to check for 'ADMIN' role in real scenario
    return this.usersService.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post(':id/lock')
  async lockAccount(@Param('id') id: string) {
    // Requires ADMIN role
    return this.usersService.lockAccount(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post(':id/unlock')
  async unlockAccount(@Param('id') id: string) {
    // Requires ADMIN role
    return this.usersService.unlockAccount(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':id')
  async deactivateAccount(@Param('id') id: string) {
    // Requires ADMIN role
    return this.usersService.deactivateAccount(id);
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
