import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    const bypass = this.configService.get<string>('AUTH_BYPASS') === 'true' || process.env.AUTH_BYPASS === 'true';
    if (bypass) {
      request.user = {
        sub: (request.headers['x-user-id'] as string) || 'dev-mock-user-001',
        email: (request.headers['x-user-email'] as string) || 'dev@genzite.local',
        roles: ((request.headers['x-user-roles'] as string) || 'ADMIN,USER').split(','),
      };
      return true;
    }

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid Authorization header');
    }

    const token = authHeader.split(' ')[1];
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('JWT_SECRET') || 'dev-jwt-secret-change-in-production-please',
      });
      request.user = payload;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
