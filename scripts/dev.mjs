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

// --all only runs on DB services (skip gateway)
const ALL_SERVICES = Object.keys(SCHEMA_MAP).filter((s) => SCHEMA_MAP[s] !== null);

// ─── Parse .env file ───────────────────────────────────────────────
function loadEnvFile(filePath) {
  if (!existsSync(filePath)) {
    console.error(`❌ .env file not found: ${filePath}`);
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
function buildDatabaseUrl(env, serviceName) {
  if (!(serviceName in SCHEMA_MAP)) {
    console.error(`❌ Unknown service: ${serviceName}`);
    console.error(`   Available: ${Object.keys(SCHEMA_MAP).join(', ')}`);
    process.exit(1);
  }

  const schema = SCHEMA_MAP[serviceName];
  if (!schema) return null; // Gateway has no database

  const user = env.POSTGRES_USER || 'genzite_user';
  const pass = env.POSTGRES_PASSWORD || 'genzite_password';
  const host = env.POSTGRES_HOST || 'localhost';
  const port = env.POSTGRES_PORT || '5432';
  const db = env.POSTGRES_DB || 'genzite_dev';

  return `postgresql://${user}:${pass}@${host}:${port}/${db}?schema=${schema}`;
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
    console.error(`❌ Service directory not found: ${serviceDir}`);
    return false;
  }

  const databaseUrl = buildDatabaseUrl(sharedEnv, serviceName);

  // Build the full command
  let fullCommand;
  if (command.startsWith('prisma')) {
    if (!databaseUrl) {
      console.log(`\n⏭️  [${serviceName}] Skipped (no database)`);
      return true;
    }
    fullCommand = `npx ${command}`;
  } else {
    fullCommand = `npm run ${command}`;
  }

  console.log(`\n🚀 [${serviceName}] Running: ${fullCommand}`);
  console.log(`   📁 Dir: ${serviceDir}`);
  if (databaseUrl) console.log(`   🔗 Schema: ${SCHEMA_MAP[serviceName]}`);

  try {
    execSync(fullCommand, {
      cwd: serviceDir,
      stdio: 'inherit',
      env: {
        ...process.env,
        ...sharedEnv,
        ...(databaseUrl ? { DATABASE_URL: databaseUrl } : {}),
      },
    });
    console.log(`✅ [${serviceName}] Done!`);
    return true;
  } catch {
    console.error(`❌ [${serviceName}] Failed!`);
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
  console.error('❌ Specify --service <name> or --all');
  process.exit(1);
}

// Load shared .env
const envPath = join(ROOT, 'infra', '.env');
const sharedEnv = loadEnvFile(envPath);
console.log(`📦 Loaded shared env from: ${envPath}`);

// Run
const services = runAll ? ALL_SERVICES : [service];
let failed = 0;

for (const svc of services) {
  if (!runInService(svc, command, sharedEnv)) failed++;
}

if (runAll) {
  console.log(`\n${'═'.repeat(50)}`);
  console.log(`✅ ${services.length - failed}/${services.length} services succeeded`);
  if (failed) console.log(`❌ ${failed} failed`);
}

process.exit(failed > 0 ? 1 : 0);
