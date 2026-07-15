import { Request } from 'express';

export interface AuthUser {
  sub: string;
  email: string;
  roles: string | string[];
  [key: string]: any;
}

export interface RequestWithUser extends Request {
  user?: AuthUser;
}
