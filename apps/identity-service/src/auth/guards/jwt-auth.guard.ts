import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const xUserId = request.headers['x-user-id'];
    const xUserEmail = request.headers['x-user-email'];
    const xUserRoles = request.headers['x-user-roles'];

    if (xUserId && xUserEmail) {
      // Trust the gateway's validation and user headers
      request.user = {
        sub: xUserId,
        email: xUserEmail,
        roles: xUserRoles ? (typeof xUserRoles === 'string' ? xUserRoles.split(',') : xUserRoles) : [],
      };
      return true;
    }

    // Otherwise, fall back to passport validation
    try {
      const passportGuard = new (class extends AuthGuard('jwt') {})();
      return await (passportGuard.canActivate(context) as Promise<boolean>);
    } catch (err) {
      throw new UnauthorizedException('Authentication failed or token expired');
    }
  }
}
