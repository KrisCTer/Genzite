/**
 * Extract current user from request headers.
 *
 * The API Gateway injects these headers before forwarding:
 * - `x-user-id`    — User's UUID
 * - `x-user-email` — User's email
 * - `x-user-roles` — Comma-separated roles (e.g. "ADMIN,USER")
 *
 * In dev mode (AUTH_BYPASS), these come from the mock user.
 * In production, these come from the verified JWT.
 *
 * Usage in a NestJS controller:
 * ```ts
 * @Get('me')
 * getMe(@Headers() headers: Record<string, string>) {
 *   const user = extractRequestUser(headers);
 *   return user;
 * }
 * ```
 */
export interface RequestUser {
  id: string;
  email: string;
  roles: string[];
}

export function extractRequestUser(
  headers: Record<string, string | string[] | undefined>,
): RequestUser | null {
  const id = headers['x-user-id'];
  if (!id) return null;

  return {
    id: Array.isArray(id) ? id[0] : id,
    email: (Array.isArray(headers['x-user-email'])
      ? headers['x-user-email'][0]
      : headers['x-user-email']) ?? '',
    roles: ((Array.isArray(headers['x-user-roles'])
      ? headers['x-user-roles'][0]
      : headers['x-user-roles']) ?? '')
      .split(',')
      .filter(Boolean),
  };
}

/**
 * Check if the current user has a specific role.
 */
export function hasRole(user: RequestUser | null, role: string): boolean {
  return user?.roles.includes(role) ?? false;
}

/**
 * Check if the current user has any of the specified roles.
 */
export function hasAnyRole(user: RequestUser | null, roles: string[]): boolean {
  return user?.roles.some((r) => roles.includes(r)) ?? false;
}
