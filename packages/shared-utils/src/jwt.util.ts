import jwt, { type JwtPayload } from 'jsonwebtoken';

export interface GenziteJwtPayload extends JwtPayload {
  sub: string;
  email: string;
  roles: string[];
}

/**
 * Verify and decode a JWT token.
 * Used by Gateway to extract user info before proxying to downstream services.
 */
export function verifyToken(token: string, secret: string): GenziteJwtPayload {
  return jwt.verify(token, secret) as GenziteJwtPayload;
}

/**
 * Sign a new JWT token.
 * Used by Identity Service during login/register.
 */
export function signToken(
  payload: { sub: string; email: string; roles: string[] },
  secret: string,
  expiresIn: number = 86400,
): string {
  return jwt.sign(payload, secret, { expiresIn });
}

/**
 * Decode a JWT without verification (useful for logging/debugging).
 */
export function decodeToken(token: string): GenziteJwtPayload | null {
  return jwt.decode(token) as GenziteJwtPayload | null;
}

/**
 * Extract Bearer token from Authorization header value.
 * Returns null if header is missing or malformed.
 */
export function extractBearerToken(authHeader: string | undefined): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  return authHeader.slice(7);
}
