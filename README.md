# Genzite – AI-Powered No-Code Business Application Builder & Dynamic CMS

## Overview

Genzite is an AI No-Code platform that enables users to create and operate fully functional web applications using natural language. Powered by Google Gemini, it automatically generates frontend interfaces, backend APIs, dynamic CMS structures, and AI-driven business features.

## 🚀 Key Features Implemented

- **Admin Console (Centralized Dashboard)**: 
  - **Identity**: Full User & Role Management via AWS Cognito.
  - **System Health**: Real-time observability for all microservices.
  - **AI Metrics**: Token usage and cost tracking for Gemini, Deepseek, Groq, and NVIDIA NIM.
  - **Background Jobs**: Embedded BullMQ dashboard for task monitoring.
  - **Global Settings & Notifications**: Centralized config and system-wide notifications.
- **Site Builder Workspace**: Interactive visual builder integrated with GrapesJS for drag-and-drop web design.
- **AI Multi-Agent System**: Intelligent task routing using MCP (Model Context Protocol), capable of reasoning and executing complex workflows.
- **Microservices Architecture**: 6 fully decoupled NestJS backend services communicating via Kafka and API Gateway.

## Tech Stack

| Layer | Technology |
|---|---|
| **Backend** | NestJS Microservices (6 independent services + API Gateway) |
| **Frontend** | React + Vite + TypeScript + Tailwind CSS v4 |
| **Database** | PostgreSQL (Relational + JSONB) |
| **Cache/Queue** | Redis (Session + Cache + BullMQ) |
| **AI Engine** | Google Gemini API + Groq (Llama3) + Model Context Protocol (MCP) + Multi-Agent System |
| **Cloud** | AWS (Cognito, Route 53, CloudFront, S3, ALB, EC2, RDS, ElastiCache) |

## Repository Structure

```text
genzite/
├── apps/                        # All deployable applications
│   ├── gateway/                 # API Gateway (port 3000)
│   ├── identity-service/        # Auth, JWT, AWS Cognito, RBAC (port 3001)
│   ├── site-service/            # Sites, Pages, Widgets, Builder (port 3002)
│   ├── data-service/            # Dynamic CMS JSONB (port 3003)
│   ├── media-service/           # AWS S3 Presigned URLs (port 3004)
│   ├── notification-service/    # Email, Push, In-App (port 3005)
│   ├── ai-service/              # Gemini, Deepseek, NIM, Groq, MCP (port 3006)
│   └── frontend/                # React + Vite + Tailwind CSS
├── packages/                    # Shared libraries
│   ├── shared-types/            # DTOs, Kafka Events, Constants
│   ├── shared-utils/            # JWT, Pagination, Validation helpers
│   └── shared-ui/               # Shared React components (Ant Design + Tailwind)
├── infra/                       # Docker Compose + shared .env
│   ├── .env.example             # Template config for the team (Mocked keys)
│   ├── .env                     # Local environment variables
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

1. **Microservices**: 6 independent NestJS services, each with its own DB schema.
2. **API Gateway**: All frontend traffic routes through `apps/gateway` (port 3000).
3. **JSONB-First Dynamic Data**: All user-generated CMS content uses PostgreSQL JSONB columns.
4. **S3 Direct Upload**: Media files bypass the backend entirely via Presigned URLs.
5. **AI Multi-Agent & MCP**: AI service interacts via Multi-Agent architecture. The service connects to external tools via the Model Context Protocol (MCP).
6. **Event-Driven**: Services communicate asynchronously via Kafka events and BullMQ.
7. **Clean Code**: High standards for code cleanliness, no unused exports/dependencies.

## AI Agent Workflow

Any AI agent **MUST** read all files under `/.ai/` and `/docs/` before proposing or generating implementation code.

## Production Deployment

Genzite is configured for automated CI/CD deployment to **AWS ECS (Fargate)** and **Vercel**:
- **Unified Dockerfile**: A single multi-stage `infra/Dockerfile.prod` uses `pnpm --filter` to selectively build any of the microservices or the API Gateway from the root context.
- **Backend CI/CD**: `.github/workflows/deploy-production.yml` uses a matrix strategy to concurrently build and push images to Amazon ECR, followed by an ECS rolling update.
- **Frontend CI/CD**: `.github/workflows/deploy-frontend.yml` automatically deploys the React frontend to Vercel.

**Required GitHub Secrets:** `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_ACCOUNT_ID`, `VERCEL_TOKEN`.

## Development Setup

> 📖 **Full Guide**: See [DEVELOPMENT.md](./DEVELOPMENT.md) for detailed step-by-step instructions.

### Quick Start (5 minutes)

```bash
# 1. Install dependencies
pnpm install
pnpm run build:packages

# 2. Configuration (Fill in your actual API keys in infra/.env)
cp infra/.env.example infra/.env

# 3. Start Database + Redis + Kafka
cd infra && docker compose up -d db cache zookeeper kafka && cd ..

# 4. Create tables & Seed data
pnpm run prisma:migrate

# 5. Run Backend (1 terminal per command)
pnpm run dev:gateway     # port 3000
pnpm run dev:identity    # port 3001
pnpm run dev:site        # port 3002
pnpm run dev:data        # port 3003
pnpm run dev:media       # port 3004
pnpm run dev:notification# port 3005
pnpm run dev:ai          # port 3006

# 6. Run Frontend
pnpm run dev:frontend    # http://localhost:5173
```

### Environment Variables

The project uses a **single shared `.env` file** located at `infra/.env` which drives all microservices. Never commit this file to version control. Reference `infra/.env.example` for the required keys.