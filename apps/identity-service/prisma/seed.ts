import { PrismaClient } from '@prisma/client-identity';

const prisma = new PrismaClient();

const SYSTEM_ROLES = [
  { name: 'OWNER', description: 'Workspace owner — full access to everything', isSystem: true },
  { name: 'ADMIN', description: 'Administrator — manages users, settings, and content', isSystem: true },
  { name: 'EDITOR', description: 'Content editor — creates and manages content', isSystem: true },
  { name: 'VIEWER', description: 'Read-only access to published content', isSystem: true },
];

const DEFAULT_PERMISSIONS = [
  // User management
  { action: 'create', resource: 'user', description: 'Create new users' },
  { action: 'read', resource: 'user', description: 'View user profiles' },
  { action: 'update', resource: 'user', description: 'Edit user profiles' },
  { action: 'delete', resource: 'user', description: 'Remove users' },

  // Site management
  { action: 'create', resource: 'site', description: 'Create new sites' },
  { action: 'read', resource: 'site', description: 'View sites' },
  { action: 'update', resource: 'site', description: 'Edit site settings' },
  { action: 'delete', resource: 'site', description: 'Delete sites' },

  // Page management
  { action: 'create', resource: 'page', description: 'Create new pages' },
  { action: 'read', resource: 'page', description: 'View pages' },
  { action: 'update', resource: 'page', description: 'Edit pages' },
  { action: 'delete', resource: 'page', description: 'Delete pages' },
  { action: 'publish', resource: 'page', description: 'Publish pages' },

  // CMS data
  { action: 'create', resource: 'data', description: 'Create CMS records' },
  { action: 'read', resource: 'data', description: 'View CMS records' },
  { action: 'update', resource: 'data', description: 'Edit CMS records' },
  { action: 'delete', resource: 'data', description: 'Delete CMS records' },

  // Media
  { action: 'upload', resource: 'media', description: 'Upload media files' },
  { action: 'read', resource: 'media', description: 'View media files' },
  { action: 'delete', resource: 'media', description: 'Delete media files' },

  // AI features
  { action: 'use', resource: 'ai', description: 'Access AI features' },

  // Settings
  { action: 'manage', resource: 'settings', description: 'Manage workspace settings' },
  { action: 'manage', resource: 'roles', description: 'Manage roles and permissions' },
];

const ROLE_PERMISSION_MAP: Record<string, string[]> = {
  OWNER: ['*'], // All permissions
  ADMIN: [
    'create:user', 'read:user', 'update:user', 'delete:user',
    'create:site', 'read:site', 'update:site', 'delete:site',
    'create:page', 'read:page', 'update:page', 'delete:page', 'publish:page',
    'create:data', 'read:data', 'update:data', 'delete:data',
    'upload:media', 'read:media', 'delete:media',
    'use:ai',
    'manage:settings', 'manage:roles',
  ],
  EDITOR: [
    'read:user',
    'read:site',
    'create:page', 'read:page', 'update:page', 'publish:page',
    'create:data', 'read:data', 'update:data',
    'upload:media', 'read:media',
    'use:ai',
  ],
  VIEWER: [
    'read:user', 'read:site', 'read:page', 'read:data', 'read:media',
  ],
};

async function main() {
  console.log('🌱 Seeding identity database...');

  // Upsert roles
  const roleRecords: Record<string, string> = {};
  for (const role of SYSTEM_ROLES) {
    const record = await prisma.role.upsert({
      where: { name: role.name },
      update: { description: role.description },
      create: role,
    });
    roleRecords[record.name] = record.id;
    console.log(`  ✅ Role: ${record.name}`);
  }

  // Upsert permissions
  const permRecords: Record<string, string> = {};
  for (const perm of DEFAULT_PERMISSIONS) {
    const record = await prisma.permission.upsert({
      where: { action_resource: { action: perm.action, resource: perm.resource } },
      update: { description: perm.description },
      create: perm,
    });
    permRecords[`${record.action}:${record.resource}`] = record.id;
    console.log(`  ✅ Permission: ${record.action}:${record.resource}`);
  }

  // Assign permissions to roles
  for (const [roleName, perms] of Object.entries(ROLE_PERMISSION_MAP)) {
    const roleId = roleRecords[roleName];
    const permIds = perms[0] === '*'
      ? Object.values(permRecords)
      : perms.map((p) => permRecords[p]).filter(Boolean);

    for (const permissionId of permIds) {
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId, permissionId } },
        update: {},
        create: { roleId, permissionId },
      });
    }
    console.log(`  🔗 ${roleName} → ${permIds.length} permissions`);
  }

  console.log('✅ Seed completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
