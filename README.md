# Genzite – AI-Powered No-Code Business Application Builder & Dynamic CMS

## Overview

Genzite is an AI No-Code platform that enables users to create and operate fully functional web applications using natural language. Powered by Google Gemini, it automatically generates frontend interfaces, backend APIs, dynamic CMS structures, and AI-driven business features.

## Tech Stack

| Layer | Technology |
|---|---|
| **Backend** | NestJS Microservices (7 independent services) |
| **Frontend** | React + Vite + TypeScript + Tailwind CSS v4 |
| **Database** | PostgreSQL (Relational + JSONB) |
| **Cache/Queue** | Redis (Session + Cache + BullMQ) |
| **AI Engine** | Google Gemini API + Model Context Protocol (MCP) + Multi-Agent System |
| **Cloud** | AWS (Route 53, CloudFront, S3, ALB, EC2, RDS, ElastiCache) |

## Repository Structure

```
genzite/
├── apps/                        # All deployable applications
│   ├── gateway/                 # API Gateway (port 3000)
│   ├── identity-service/        # Auth, JWT, RBAC (port 3001)
│   ├── site-service/            # Sites, Pages, Widgets (port 3002)
│   ├── data-service/            # Dynamic CMS JSONB (port 3003)
│   ├── media-service/           # S3 Presigned URLs (port 3004)
│   ├── notification-service/    # Email, Push, In-App (port 3005)
│   ├── ai-service/              # Google Gemini (port 3006)
│   └── frontend/                # React + Vite + Tailwind CSS
├── packages/                    # Shared libraries
│   ├── shared-types/            # DTOs, Kafka Events, Constants
│   ├── shared-utils/            # JWT, Pagination, Validation helpers
│   └── shared-ui/               # Shared React components
├── infra/                       # Docker Compose + shared .env
│   ├── .env.example             # Template config for the team
│   └── docker-compose.yml       # PostgreSQL, Redis, Kafka, services
├── scripts/
│   └── dev.mjs                  # Dev CLI — run services with shared .env
├── docs/                        # Product spec, DB design, API contracts
├── DEVELOPMENT.md               # 📖 Project development guide
├── pnpm-workspace.yaml          # Root workspace: apps/* and packages/*
├── package.json                 # Root scripts and global dependencies
└── README.md                    # Project overview
```

## Architecture Principles

1. **Microservices**: 7 independent NestJS services, each with its own DB schema.
2. **API Gateway**: All frontend traffic routes through `apps/gateway` (port 3000).
3. **JSONB-First Dynamic Data**: All user-generated CMS content uses PostgreSQL JSONB columns.
4. **S3 Direct Upload**: Media files bypass the backend entirely via Presigned URLs.
5. **AI Multi-Agent & MCP**: Gemini API calls run in `ai-service` via a Multi-Agent architecture (Planner, UI Designer, Tool-calling). The service connects to external tools and exposes its own tools via the Model Context Protocol (MCP).
6. **Event-Driven**: Services communicate asynchronously via Kafka events and BullMQ.
7. **Cozy Design**: UI must feel warm, friendly, and community-oriented.

## AI Agent Workflow

Any AI agent **MUST** read all files under `/.ai/` and `/docs/` before proposing or generating implementation code.

## Development Setup

> 📖 **Full Guide**: See [DEVELOPMENT.md](./DEVELOPMENT.md) for detailed step-by-step instructions.

### Quick Start (5 minutes)

```bash
# 1. Install dependencies
pnpm install
pnpm run build:packages

# 2. Configuration
cp infra/.env.example infra/.env

# 3. Start Database + Redis + Kafka
cd infra && docker compose up -d db cache zookeeper kafka && cd ..

# 4. Create tables
pnpm run prisma:migrate

# 5. Run Backend (1 terminal per command)
pnpm run dev:gateway     # port 3000
pnpm run dev:site        # port 3002
pnpm run dev:data        # port 3003

# 6. Run Frontend
pnpm run dev:frontend    # http://localhost:5173
```

> **💡 Note**: Identity Service does not need to run initially — Gateway automatically bypasses auth with a mock user (ADMIN).

### Access Points

| Service | URL |
|---|---|
| Frontend | `http://localhost:5173` |
| API Gateway | `http://localhost:3000/api/v1` |
| Site Service | `http://localhost:3002` |
| Data Service | `http://localhost:3003` |
| Media Service | `http://localhost:3004` |
| Notification Service | `http://localhost:3005` |
| AI Service | `http://localhost:3006` |
| PostgreSQL | `localhost:5432` |
| Redis | `localhost:6379` |
| Kafka | `localhost:29092` |

### Environment Variables

The project uses a **single shared `.env` file** at `infra/.env`. See [DEVELOPMENT.md](./DEVELOPMENT.md#3-environment-configuration) for details.