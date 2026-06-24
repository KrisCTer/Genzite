# 🛠️ Genzite Development Guide

> This document is for **all team members**. Read it from start to finish to be able to run the project locally.

---

## 📋 Table of Contents

1. [System Requirements](#1-system-requirements)
2. [Clone & Install](#2-clone--install)
3. [Environment Configuration](#3-environment-configuration)
4. [Start Infrastructure](#4-start-infrastructure-docker)
5. [Database Migration](#5-database-migration-prisma)
6. [Run Backend](#6-run-backend)
7. [Run Frontend](#7-run-frontend)
8. [Architecture Overview](#8-architecture-overview)
9. [Common Commands (Cheat Sheet)](#9-common-commands-cheat-sheet)
10. [Troubleshooting](#10-troubleshooting)

---

## 1. System Requirements

Install the following tools before starting:

| Tool | Version | Download | Check |
|------|---------|----------|----------|
| **Node.js** | ≥ 18 | [nodejs.org](https://nodejs.org/) | `node -v` |
| **npm** | ≥ 9 | Included with Node.js | `npm -v` |
| **Docker Desktop** | Latest | [docker.com](https://www.docker.com/products/docker-desktop/) | `docker -v` |
| **Git** | Latest | [git-scm.com](https://git-scm.com/) | `git -v` |

> **⚠️ Windows**: Ensure Docker Desktop has **WSL 2 backend** enabled in Settings → General.

---

## 2. Clone & Install

```bash
# Clone repo
git clone <repo-url> Genzite
cd Genzite

# Install dependencies for the entire monorepo (run once)
pnpm install

# Build shared packages (MANDATORY — services depend on them)
pnpm run build:packages
```

> **📝 Note**: The project uses [pnpm workspaces](https://pnpm.io/workspaces). Running `pnpm install` at the root will install dependencies for ALL apps and packages simultaneously.

---

## 3. Environment Configuration

The project uses a **single shared `.env` file** located in `infra/`:

```bash
# Copy the example file
cp infra/.env.example infra/.env
```

The default content is sufficient for local development. **No changes are needed** unless you want to change the DB password or add API keys:

```env
# infra/.env — Default values

# PostgreSQL
POSTGRES_USER=genzite_user
POSTGRES_PASSWORD=genzite_password
POSTGRES_DB=genzite_dev
POSTGRES_HOST=localhost
POSTGRES_PORT=5432

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Kafka
KAFKA_BROKERS=localhost:29092

# Auth (AUTH_BYPASS=true → no need to run identity-service)
AUTH_BYPASS=true
JWT_SECRET=dev-jwt-secret-change-in-production-please

# AI (add key if you need to test AI features)
GEMINI_API_KEY=your-google-gemini-api-key
DEEPSEEK_API_KEY=your-deepseek-api-key

# AWS S3 (add if you need to test uploads)
AWS_S3_BUCKET=genzite-media-dev
AWS_REGION=ap-southeast-1
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
```

### ❓ Why only one `.env` file?

The script `scripts/dev.mjs` will:
1. Read `infra/.env`
2. Automatically build the `DATABASE_URL` with the correct schema for each service:
   - site-service → `postgresql://...?schema=site`
   - data-service → `postgresql://...?schema=data`
   - etc.
3. Inject all variables into the process when running

→ **There is no need to create separate `.env` files in each service.**

---

## 4. Start Infrastructure (Docker)

> **This step runs PostgreSQL, Redis, Kafka** — the foundation for all backend services.

```bash
cd infra
docker compose up -d db cache zookeeper kafka
```

Wait about 30 seconds, then check:

```bash
docker compose ps
```

Expected result — all must be in `healthy` state:

```
NAME                STATUS
genzite-db          Up (healthy)
genzite-cache       Up (healthy)
genzite-zookeeper   Up (healthy)
genzite-kafka       Up (healthy)
```

> **⚠️ If Kafka is not healthy**: Wait another 30-60 seconds — Kafka takes longer to start.

### Stop Infrastructure

```bash
cd infra
docker compose down          # Stop but keep data
docker compose down -v       # Stop AND REMOVE all data (reset DB)
```

---

## 5. Database Migration (Prisma)

> **Create tables in PostgreSQL** from Prisma schemas. Only needs to be run once (or when schema changes).

```bash
# From the project ROOT directory (not inside infra/)
cd ..  # or cd Genzite

# Migrate ALL 6 services
pnpm run prisma:migrate
```

Prisma will ask for a migration name for each service → enter: `init` (or a descriptive name).

### Migrate Individual Services

```bash
pnpm run prisma:migrate:site
pnpm run prisma:migrate:data
pnpm run prisma:migrate:media
pnpm run prisma:migrate:notification
pnpm run prisma:migrate:ai
pnpm run prisma:migrate:identity
```

### When to run again?

| Situation | Command |
|------------|------|
| Modified `schema.prisma` file | `pnpm run prisma:migrate` |
| Pulled new code with migrations | `pnpm run prisma:migrate` |
| Just need to generate client (no new migration) | `pnpm run prisma:generate` |

---

## 6. Run Backend

### 🔹 Method 1: Local Dev (RECOMMENDED)

Open a **separate terminal** for each command (or use split terminals in VS Code):

```bash
# Terminal 1 — API Gateway (port 3000)
pnpm run dev:gateway

# Terminal 2 — Site Service (port 3002)
pnpm run dev:site

# Terminal 3 — Data Service (port 3003)
pnpm run dev:data

# Terminal 4 — Media Service (port 3004)
pnpm run dev:media

# Terminal 5 — Notification Service (port 3005)
pnpm run dev:notification

# Terminal 6 — AI Service (port 3006)
pnpm run dev:ai
```

> **💡 You don't need to run them all at once!** If you are only working on site-service, just run `dev:gateway` + `dev:site`.

> **⏸️ Identity Service (port 3001)** — No need to run yet. The Gateway has `AUTH_BYPASS=true` and automatically attaches a mock user (ADMIN role) to every request.

### 🔹 Method 2: Docker Compose (full stack)

```bash
cd infra
docker compose up -d
```

Starts **everything**: DB + Redis + Kafka + 7 backend services + Frontend.

### When to use which method?

| Situation | Method |
|------------|------|
| Coding/debugging your own service | **Local Dev** (fast hot-reload) |
| Need to test cross-service APIs | **Local Dev** (run the 2-3 related services) |
| Demo / full integration test | **Docker Compose** |

---

## 7. Run Frontend

```bash
# Separate terminal
pnpm run dev:frontend
```

Open browser: **http://localhost:5173**

The Frontend will call APIs through the Gateway at `http://localhost:3000/api/v1/...`

---

## 8. Architecture Overview

### Request Flow

```
Browser (http://localhost:5173)
    ↓
API Gateway (:3000)
    ├── AuthMiddleware (bypass → mock ADMIN user)
    ├── /api/v1/sites/*         → Site Service (:3002)
    ├── /api/v1/cms/*           → Data Service (:3003)
    ├── /api/v1/media/*         → Media Service (:3004)
    ├── /api/v1/notifications/* → Notification Service (:3005)
    ├── /api/v1/ai/*            → AI Service (:3006)
    └── /api/v1/auth/*          → Identity Service (:3001) [not running]
```

### Directory Structure

```
Genzite/
├── apps/                    # Applications (services + frontend)
│   ├── gateway/             # API Gateway — proxy + auth
│   ├── identity-service/    # Auth, JWT, RBAC
│   ├── site-service/        # Sites, Pages, Widgets
│   ├── data-service/        # Dynamic CMS (JSONB)
│   ├── media-service/       # File upload, S3
│   ├── notification-service/# Email, Push, In-App
│   ├── ai-service/          # Multi-Agent, MCP, Pipeline Engine, Gemini AI
│   └── frontend/            # React + Vite + Tailwind
│
├── packages/                # Shared libraries
│   ├── shared-types/        # DTOs, Kafka events, constants
│   ├── shared-utils/        # JWT helpers, pagination, validation
│   └── shared-ui/           # Shared React components
│
├── infra/                   # Infrastructure
│   ├── .env                 # ⭐ Shared config (DO NOT commit)
│   ├── .env.example         # Template for team
│   └── docker-compose.yml   # PostgreSQL, Redis, Kafka, services
│
├── scripts/
│   └── dev.mjs              # Dev CLI — runs services with shared .env
│
├── package.json             # Root workspace + npm scripts
└── DEVELOPMENT.md           # 📖 This file!
```

### Database Schema Isolation

Each service uses its own PostgreSQL schema (within the same database):

| Service | Schema | Tables |
|---------|--------|--------|
| identity-service | `identity` | users, roles, permissions, refresh_tokens |
| site-service | `site` | sites, pages, widgets |
| data-service | `data` | cms_collections, cms_records |
| media-service | `media` | media_files, media_folders, media_tags |
| notification-service | `notification` | notifications, notification_templates |
| ai-service | `ai` | resumes, interview_sessions, ai_task_logs |

---

## 9. Common Commands (Cheat Sheet)

### Initial Setup

```bash
pnpm install                   # Install dependencies
pnpm run build:packages        # Build shared packages
cp infra/.env.example infra/.env  # Create config file
```

### Docker

```bash
cd infra
docker compose up -d db cache zookeeper kafka   # Start infra
docker compose ps                                # View status
docker compose logs -f kafka                     # View Kafka logs
docker compose down                              # Stop
docker compose down -v                           # Stop + delete data
```

### Prisma (Database)

```bash
pnpm run prisma:migrate              # Migrate all services
pnpm run prisma:migrate:site         # Migrate site-service only
pnpm run prisma:generate             # Generate all Prisma Clients
```

### Run Services

```bash
pnpm run dev:gateway                 # Gateway (:3000)
pnpm run dev:site                    # Site Service (:3002)
pnpm run dev:data                    # Data Service (:3003)
pnpm run dev:media                   # Media Service (:3004)
pnpm run dev:notification            # Notification (:3005)
pnpm run dev:ai                      # AI Service (:3006)
pnpm run dev:frontend                # Frontend (:5173)
```

### Dev CLI (Advanced)

```bash
node scripts/dev.mjs prisma migrate dev -s site-service    # Migrate 1 service
node scripts/dev.mjs prisma generate --all                 # Generate all
node scripts/dev.mjs start:dev -s data-service             # Run 1 service
```

### Build & Test

```bash
pnpm run build:all                   # Build all workspaces
pnpm run test:all                    # Test all workspaces
```

---

## 10. Troubleshooting

### ❌ `pnpm install` fails

```bash
# Delete node_modules and lock file, reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### ❌ Docker containers are not healthy

```bash
# View detailed logs
cd infra
docker compose logs db        # PostgreSQL errors
docker compose logs kafka     # Kafka errors

# Full reset
docker compose down -v
docker compose up -d db cache zookeeper kafka
```

### ❌ Prisma migrate error "database does not exist"

```bash
# Ensure PostgreSQL is running
docker compose ps  # db must be healthy

# If it still fails, reset the DB
cd infra
docker compose down -v
docker compose up -d db cache zookeeper kafka
# Wait 10 seconds
pnpm run prisma:migrate
```

### ❌ "Cannot find module @genzite/shared-types"

```bash
# Rebuild shared packages
pnpm run build:packages
```

### ❌ Port is already in use

```bash
# Windows — find process using the port (e.g., 3000)
netstat -ano | findstr :3000
# The last column in the result is the PID → kill it
taskkill /PID <pid> /F
```

### ❌ PowerShell execution policy error

```bash
# Use cmd instead of PowerShell, or run:
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

---

## Contact

If you still encounter irresolvable errors, contact the team lead or open an issue on the repository.
