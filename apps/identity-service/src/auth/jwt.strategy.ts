import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    // Re-validates JWT after gateway — JWT_SECRET must match gateway config
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'dev-secret-key', // Ensure this matches sign key
    });
  }

  async validate(payload: any) {
    return { sub: payload.sub, email: payload.email, roles: payload.roles };
  }
}
