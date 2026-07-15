import { normalizeRoles } from './userNav';

export function getRolesFromToken(token: string | null | undefined): string[] {
  if (!token) return [];
  try {
    const payload = JSON.parse(atob(token.split('.')[1])) as { roles?: string[], 'cognito:groups'?: string[] };
    const roles = payload.roles || payload['cognito:groups'] || [];
    return normalizeRoles(Array.isArray(roles) ? roles : []);
  } catch {
    return [];
  }
}

export function resolveUserRoles(userRoles: string[] | undefined, token: string | null | undefined): string[] {
  let roles: string[] = [];
  if (userRoles?.length) {
    roles = userRoles;
  } else {
    roles = getRolesFromToken(token);
  }
  
  if (roles.length === 0 && token) {
    return ['USER'];
  }
  return roles;
}
