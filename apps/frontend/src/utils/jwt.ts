import { normalizeRoles } from './userNav';

export function getRolesFromToken(token: string | null | undefined): string[] {
  if (!token) return [];
  try {
    const payload = JSON.parse(atob(token.split('.')[1])) as { roles?: string[] };
    return normalizeRoles(Array.isArray(payload.roles) ? payload.roles : []);
  } catch {
    return [];
  }
}

export function resolveUserRoles(userRoles: string[] | undefined, token: string | null | undefined): string[] {
  if (userRoles?.length) return userRoles;
  return getRolesFromToken(token);
}
