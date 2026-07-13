export const STAFF_ROLES = ['ADMIN', 'EDITOR'] as const;
export const MEMBER_ROLES = ['ADMIN', 'EDITOR', 'VIEWER'] as const;
export const VIEWER_ROLES = ['VIEWER'] as const;

export const WORKSPACE_BASE = '/workspace';
export const ADMIN_BASE = '/admin';

export type UserNavItem = {
  key: string;
  label: string;
  path: string;
  roles: readonly string[];
};

export const WORKSPACE_NAV_ITEMS: UserNavItem[] = [
  { key: 'dashboard', label: 'Dashboard', path: WORKSPACE_BASE, roles: VIEWER_ROLES },
  { key: 'profile', label: 'Profile', path: `${WORKSPACE_BASE}/profile`, roles: VIEWER_ROLES },
  { key: 'canvas', label: 'AI Canvas', path: '/project', roles: VIEWER_ROLES },
];

export const ADMIN_NAV_ITEMS: UserNavItem[] = [
  { key: 'dashboard', label: 'Dashboard', path: ADMIN_BASE, roles: STAFF_ROLES },
  { key: 'profile', label: 'Profile', path: `${ADMIN_BASE}/profile`, roles: STAFF_ROLES },
  { key: 'notifications', label: 'Notifications', path: `${ADMIN_BASE}/notifications`, roles: STAFF_ROLES },
  { key: 'identity', label: 'User Management', path: `${ADMIN_BASE}/identity`, roles: ['ADMIN'] },

  { key: 'media', label: 'Media Library', path: `${ADMIN_BASE}/media`, roles: STAFF_ROLES },
  { key: 'cms', label: 'Data CMS', path: `${ADMIN_BASE}/cms`, roles: STAFF_ROLES },
  { key: 'site', label: 'Site Builder', path: `${ADMIN_BASE}/site`, roles: STAFF_ROLES },
  { key: 'canvas', label: 'AI Canvas', path: '/project', roles: STAFF_ROLES },
];

export function normalizeRoles(roles: string[] | undefined): string[] {
  return (roles ?? []).map((r) => r.toUpperCase());
}

export function hasRole(roles: string[] | undefined, allowed: readonly string[]): boolean {
  const normalized = normalizeRoles(roles);
  return normalized.some((r) => allowed.includes(r));
}

export function hasMemberAccess(roles: string[] | undefined): boolean {
  return hasRole(roles, MEMBER_ROLES);
}

export function hasStaffAccess(roles: string[] | undefined): boolean {
  return hasRole(roles, STAFF_ROLES);
}

export function isViewerOnly(roles: string[] | undefined): boolean {
  const normalized = normalizeRoles(roles);
  return normalized.includes('VIEWER') && !hasStaffAccess(normalized);
}

export function getHomePath(roles: string[] | undefined): string {
  return hasStaffAccess(roles) ? ADMIN_BASE : WORKSPACE_BASE;
}

// @ts-ignore
export function getPostLoginPath(roles: string[] | undefined): string {
  return '/';
}

export function getMemberFallbackPath(roles: string[] | undefined): string {
  if (hasStaffAccess(roles)) return ADMIN_BASE;
  if (hasMemberAccess(roles)) return WORKSPACE_BASE;
  return '/login';
}

export function getUserNavItems(roles: string[] | undefined): UserNavItem[] {
  const normalized = normalizeRoles(roles);
  if (!normalized.length) return [];
  const items = hasStaffAccess(normalized) ? ADMIN_NAV_ITEMS : WORKSPACE_NAV_ITEMS;
  return items.filter((item) => item.roles.some((r) => normalized.includes(r)));
}

export function getNotificationsPath(roles: string[] | undefined): string {
  return hasStaffAccess(roles)
    ? `${ADMIN_BASE}/notifications`
    : `${WORKSPACE_BASE}/notifications`;
}

export function getProfilePath(roles: string[] | undefined): string {
  return hasStaffAccess(roles) ? `${ADMIN_BASE}/profile` : `${WORKSPACE_BASE}/profile`;
}
