import * as dotenv from 'dotenv';
import * as path from 'path';
import * as bcrypt from 'bcryptjs';

const infraEnvPath = path.resolve(__dirname, '../../../infra/.env');
dotenv.config({ path: infraEnvPath });

function appendSchema(databaseUrl: string, schema: string): string {
  const separator = databaseUrl.includes('?') ? '&' : '?';
  return `${databaseUrl}${separator}schema=${schema}`;
}

function resolveDatabaseUrls(): void {
  if (process.env.DATABASE_URL) {
    process.env.DIRECT_URL = process.env.DIRECT_URL || process.env.DATABASE_URL;
    return;
  }

  const schema = 'identity';
  const postgresHost = process.env.POSTGRES_HOST || 'localhost';
  const preferLocal =
    process.env.DB_TARGET === 'local' ||
    process.env.USE_LOCAL_DB === 'true' ||
    postgresHost === 'localhost' ||
    postgresHost === '127.0.0.1';

  if (!preferLocal && process.env.SUPABASE_URL) {
    process.env.DATABASE_URL = appendSchema(process.env.SUPABASE_URL, schema);
    process.env.DIRECT_URL = appendSchema(
      process.env.SUPABASE_DIRECT_URL || process.env.SUPABASE_URL,
      schema,
    );
    return;
  }

  const user = process.env.POSTGRES_USER || 'genzite_user';
  const password = encodeURIComponent(process.env.POSTGRES_PASSWORD || 'genzite_password');
  const port = process.env.POSTGRES_PORT || '5432';
  const db = process.env.POSTGRES_DB || 'genzite_dev';
  const base = `postgresql://${user}:${password}@${postgresHost}:${port}/${db}`;
  process.env.DATABASE_URL = appendSchema(base, schema);
  process.env.DIRECT_URL = process.env.DIRECT_URL || process.env.DATABASE_URL;
}

resolveDatabaseUrls();

if (!process.env.DATABASE_URL) {
  throw new Error(
    `DATABASE_URL could not be resolved. Check ${infraEnvPath} or set DATABASE_URL explicitly.`,
  );
}

// Load Prisma after env is ready (import hoisting would read DATABASE_URL too early)
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { PrismaClient } = require('../node_modules/@prisma/client-identity/index.js');
const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@genzite.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@12345';

  console.log(`Seeding Admin User: ${adminEmail}...`);
  console.log(`Database target: ${process.env.DATABASE_URL?.replace(/:[^:@]+@/, ':***@')}`);

  const systemRoles = [
    { name: 'ADMIN', description: 'System Administrator' },
    { name: 'EDITOR', description: 'Content editor' },
    { name: 'VIEWER', description: 'Standard viewer' },
    { name: 'CANDIDATE', description: 'AI interview candidate' },
  ];

  for (const role of systemRoles) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: {},
      create: { ...role, isSystem: true },
    });
  }

  const role = await prisma.role.findUniqueOrThrow({ where: { name: 'ADMIN' } });

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(adminPassword, salt);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      passwordHash,
      status: 'ACTIVE',
    },
    create: {
      email: adminEmail,
      passwordHash,
      name: 'System Admin',
      status: 'ACTIVE',
    },
  });

  // Always ensure ADMIN role (update path previously skipped role assignment)
  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: admin.id,
        roleId: role.id,
      },
    },
    update: {},
    create: {
      userId: admin.id,
      roleId: role.id,
    },
  });

  console.log(`✅ Admin user seeded successfully! Email: ${admin.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
