import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { KafkaModule } from '@genzite/kafka';
import { PrismaModule } from './prisma/prisma.module.js';
import { AuthController } from './auth/auth.controller.js';
import { AuthService } from './auth/auth.service.js';
import { UsersController } from './users/users.controller.js';
import { UsersService } from './users/users.service.js';
import { IdentityProducer } from './events/identity.producer.js';

import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    KafkaModule.forRoot(),
    PrismaModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || 'dev-jwt-secret-change-in-production-please',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [AuthController, UsersController],
  providers: [AuthService, UsersService, IdentityProducer],
})
export class AppModule {}


