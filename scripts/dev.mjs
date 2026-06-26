/**
 * Genzite Dev CLI — Run commands with shared .env
 *
 * Loads infra/.env once, builds the correct DATABASE_URL for each service,
 * then runs any command you want.
 *
 * Usage (from project root):
 *   node scripts/dev.mjs prisma migrate dev --service site-service
 *   node scripts/dev.mjs prisma generate   --service ai-service
 *   node scripts/dev.mjs start:dev         --service site-service
 *   node scripts/dev.mjs prisma migrate dev --all
 */

import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { resolve, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ROOT = resolve(__dirname, '..');

// Service name → Prisma schema name mapping (null = no database)
const SCHEMA_MAP = {
  'gateway': null,
  'identity-service': 'identity',
  'site-service': 'site',
  'data-service': 'data',
  'media-service': 'media',
  'notification-service': 'notification',
  'ai-service': 'ai',
};

// Service name → default port mapping
const PORT_MAP = {
  'gateway': 3000,
  'identity-service': 3001,
  'site-service': 3002,
  'data-service': 3003,
  'media-service': 3004,
  'notification-service': 3005,
  'ai-service': 3006,
};

// --all only runs on DB services (skip gateway)
const ALL_SERVICES = Object.keys(SCHEMA_MAP).filter((s) => SCHEMA_MAP[s] !== null);

// ─── Parse .env file ───────────────────────────────────────────────
function loadEnvFile(filePath) {
  if (!existsSync(filePath)) {
    console.error(`[ERROR] .env file not found: ${filePath}`);
    process.exit(1);
  }
  const env = {};
  for (const line of readFileSync(filePath, 'utf-8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    const val = trimmed.slice(eqIndex + 1).trim().replace(/^["']|["']$/g, '');
    env[key] = val;
  }
  return env;
}

// ─── Build DATABASE_URL for a specific service ─────────────────────
function buildDatabaseUrls(env, serviceName) {
  if (!(serviceName in SCHEMA_MAP)) {
    console.error(`[ERROR] Unknown service: ${serviceName}`);
    console.error(`   Available: ${Object.keys(SCHEMA_MAP).join(', ')}`);
    process.exit(1);
  }

  const schema = SCHEMA_MAP[serviceName];
  if (!schema) return null; // Gateway has no database

  let databaseUrl, directUrl;

  if (env.SUPABASE_URL && env.SUPABASE_DIRECT_URL) {
    const sep1 = env.SUPABASE_URL.includes('?') ? '&' : '?';
    databaseUrl = `${env.SUPABASE_URL}${sep1}schema=${schema}`;
    const sep2 = env.SUPABASE_DIRECT_URL.includes('?') ? '&' : '?';
    directUrl = `${env.SUPABASE_DIRECT_URL}${sep2}schema=${schema}`;
  } else {
    const user = env.POSTGRES_USER || 'genzite_user';
    const pass = env.POSTGRES_PASSWORD || 'genzite_password';
    const host = env.POSTGRES_HOST || 'localhost';
    const port = env.POSTGRES_PORT || '5432';
    const db = env.POSTGRES_DB || 'genzite_dev';
    const localUrl = `postgresql://${user}:${pass}@${host}:${port}/${db}?schema=${schema}`;
    databaseUrl = localUrl;
    directUrl = localUrl;
  }

  return { databaseUrl, directUrl };
}

// ─── Parse CLI args ────────────────────────────────────────────────
function parseArgs(argv) {
  const args = argv.slice(2);
  let service = null;
  let runAll = false;
  const commandParts = [];

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--service' || args[i] === '-s') {
      service = args[++i];
    } else if (args[i] === '--all') {
      runAll = true;
    } else {
      commandParts.push(args[i]);
    }
  }

  return { service, runAll, command: commandParts.join(' ') };
}

// ─── Execute command in service directory ──────────────────────────
function runInService(serviceName, command, sharedEnv) {
  const serviceDir = join(ROOT, 'apps', serviceName);
  if (!existsSync(serviceDir)) {
    console.error(`[ERROR] Service directory not found: ${serviceDir}`);
    return false;
  }

  const urls = buildDatabaseUrls(sharedEnv, serviceName);

  // Build the full command
  let fullCommand;
  if (command.startsWith('prisma')) {
    if (!urls) {
      console.log(`\n[SKIP] [${serviceName}] Skipped (no database)`);
      return true;
    }
    fullCommand = `npx ${command}`;
  } else {
    fullCommand = `pnpm run ${command}`;
  }

  console.log(`\n[START] [${serviceName}] Running: ${fullCommand}`);
  console.log(`   [DIR] Dir: ${serviceDir}`);
  if (urls) console.log(`   [SCHEMA] Schema: ${SCHEMA_MAP[serviceName]}`);

  try {
    execSync(fullCommand, {
      cwd: serviceDir,
      stdio: 'inherit',
      env: {
        ...process.env,
        ...sharedEnv,
        ...(urls ? { DATABASE_URL: urls.databaseUrl, DIRECT_URL: urls.directUrl } : {}),
        PORT: String(PORT_MAP[serviceName] || 3000),
        SERVICE_NAME: serviceName,
        KAFKA_CONSUMER_GROUP: serviceName,
      },
    });
    console.log(`[SUCCESS] [${serviceName}] Done!`);
    return true;
  } catch {
    console.error(`[ERROR] [${serviceName}] Failed!`);
    return false;
  }
}

// ─── Main ──────────────────────────────────────────────────────────
const { service, runAll, command } = parseArgs(process.argv);

if (!command) {
  console.log(`
╔══════════════════════════════════════════════════════════╗
║              Genzite Dev CLI                             ║
╠══════════════════════════════════════════════════════════╣
║  Usage:                                                  ║
║    node scripts/dev.mjs <command> --service <name>       ║
║    node scripts/dev.mjs <command> --all                  ║
║                                                          ║
║  Examples:                                               ║
║    node scripts/dev.mjs prisma migrate dev -s site-service║
║    node scripts/dev.mjs prisma generate --all            ║
║    node scripts/dev.mjs start:dev -s data-service        ║
║                                                          ║
║  Services:                                               ║
║    identity-service, site-service, data-service,         ║
║    media-service, notification-service, ai-service       ║
╚══════════════════════════════════════════════════════════╝
`);
  process.exit(0);
}

if (!service && !runAll) {
  console.error('[ERROR] Specify --service <name> or --all');
  process.exit(1);
}

// Load shared .env
const envPath = join(ROOT, 'infra', '.env');
const sharedEnv = loadEnvFile(envPath);
console.log(`[INFO] Loaded shared env from: ${envPath}`);

// Run
const services = runAll ? ALL_SERVICES : [service];
let failed = 0;

for (const svc of services) {
  if (!runInService(svc, command, sharedEnv)) failed++;
}

if (runAll) {
  console.log(`\n${'═'.repeat(50)}`);
  console.log(`[SUCCESS] ${services.length - failed}/${services.length} services succeeded`);
  if (failed) console.log(`[ERROR] ${failed} failed`);
}

process.exit(failed > 0 ? 1 : 0);
