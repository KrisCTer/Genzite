import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  async register(dto: { email: string; password: string; name: string }) {
    // TODO: Hash password, save to DB, return user
    return { id: 'uuid', email: dto.email, name: dto.name };
  }

  async login(dto: { email: string; password: string }) {
    // TODO: Validate credentials, generate JWT
    return { accessToken: 'jwt-token-placeholder', expiresIn: 86400 };
  }
}
