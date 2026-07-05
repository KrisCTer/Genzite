import { Controller, Get, Param, UseGuards, Req, Post, Body, Headers, ForbiddenException, Delete } from '@nestjs/common';
import { UsersService } from './users.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { ROLES } from '@genzite/shared-types';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@Req() req: any) {
    return this.usersService.findById(req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Post('me')
  async updateProfileLegacy(@Req() req: any, @Body() body: any) {
    return this.usersService.updateProfile(req.user.sub, body);
  }

  @UseGuards(JwtAuthGuard)
  @Post('me/update')
  async updateProfileAlternative(@Req() req: any, @Body() body: any) {
    return this.usersService.updateProfile(req.user.sub, body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.ADMIN)
  @Get()
  async findAll() {
    return this.usersService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findById(@Param('id') id: string, @Req() req: any) {
    const isAdmin = req.user.roles?.includes(ROLES.ADMIN);
    if (req.user.sub !== id && !isAdmin) {
      throw new ForbiddenException('Access denied');
    }
    return this.usersService.findById(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.ADMIN)
  @Post(':id/lock')
  async lockAccount(@Param('id') id: string) {
    return this.usersService.lockAccount(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.ADMIN)
  @Post(':id/unlock')
  async unlockAccount(@Param('id') id: string) {
    return this.usersService.unlockAccount(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.ADMIN)
  @Delete(':id')
  async deactivateAccount(@Param('id') id: string) {
    return this.usersService.deactivateAccount(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.ADMIN)
  @Post(':id/roles')
  async updateRoles(@Param('id') id: string, @Body('roles') roles: string[]) {
    return this.usersService.updateRoles(id, roles);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.ADMIN)
  @Post(':id/credits/adjust')
  async adjustCredits(
    @Param('id') id: string,
    @Body('amount') amount: number,
    @Req() req: any,
  ) {
    return this.usersService.adjustCredits(id, amount, req.user.sub);
  }

  // --- INTERNAL ENDPOINTS FOR MICROSERVICES (not exposed to browser) ---
  @Post('internal/:id/deduct-credits')
  async deductCredits(
    @Headers('x-internal-token') internalToken: string,
    @Param('id') id: string,
    @Body('amount') amount: number,
  ) {
    if (internalToken !== process.env.INTERNAL_SERVICE_TOKEN) {
      throw new ForbiddenException('Invalid internal service token');
    }
    return this.usersService.deductCredits(id, amount);
  }

  @Post('internal/:id/refund-credits')
  async refundCredits(
    @Headers('x-internal-token') internalToken: string,
    @Param('id') id: string,
    @Body('amount') amount: number,
  ) {
    if (internalToken !== process.env.INTERNAL_SERVICE_TOKEN) {
      throw new ForbiddenException('Invalid internal service token');
    }
    return this.usersService.refundCredits(id, amount);
  }
}
