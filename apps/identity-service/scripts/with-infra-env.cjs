const path = require('path');
const { spawnSync } = require('child_process');

require('dotenv').config({ path: path.join(__dirname, '../../../infra/.env') });

function appendSchema(databaseUrl, schema) {
  const separator = databaseUrl.includes('?') ? '&' : '?';
  return `${databaseUrl}${separator}schema=${schema}`;
}

function resolveDatabaseUrls() {
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
  console.error('DATABASE_URL could not be resolved from infra/.env');
  process.exit(1);
}

const prismaArgs = process.argv.slice(2);
const result = spawnSync('npx', ['prisma', ...prismaArgs], {
  stdio: 'inherit',
  env: process.env,
  shell: true,
  cwd: path.join(__dirname, '..'),
});

process.exit(result.status ?? 1);
