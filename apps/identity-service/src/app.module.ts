import { Module } from '@nestjs/common';
import { AuthController } from './auth/auth.controller.js';
import { AuthService } from './auth/auth.service.js';
import { UsersController } from './users/users.controller.js';
import { UsersService } from './users/users.service.js';

@Module({
  imports: [],
  controllers: [AuthController, UsersController],
  providers: [AuthService, UsersService],
})
export class AppModule {}
