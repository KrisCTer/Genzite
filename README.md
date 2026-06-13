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
| **AI Engine** | Google Gemini API |
| **Cloud** | AWS (Route 53, CloudFront, S3, ALB, EC2, RDS, ElastiCache) |

## Repository Structure

```
genzite/
├── .ai/                         # AI agent rules & architectural guardrails
├── .cursorrules                 # Agent entry-point directive
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
│   └── shared-types/            # DTOs, Events, Constants
├── infra/                       # Docker Compose (PostgreSQL, Redis)
├── docs/                        # Product spec, DB design, API contracts
└── package.json                 # Root workspace: ["apps/*", "packages/*"]
```

## Architecture Principles

1. **Microservices**: 7 independent NestJS services, each with its own DB schema.
2. **API Gateway**: All frontend traffic routes through `apps/gateway` (port 3000).
3. **JSONB-First Dynamic Data**: All user-generated CMS content uses PostgreSQL JSONB columns.
4. **S3 Direct Upload**: Media files bypass the backend entirely via Presigned URLs.
5. **AI Isolation**: Gemini API calls run in `ai-service` with BullMQ workers to avoid blocking.
6. **Event-Driven**: Services communicate asynchronously via Kafka events.
7. **Cozy Design**: UI must feel warm, friendly, and community-oriented.

## AI Agent Workflow

Any AI agent **MUST** read all files under `/.ai/` and `/docs/` before proposing or generating implementation code.

## Development Setup

### Prerequisites
- Docker & Docker Compose
- Node.js 22+ (for local development without Docker)

### Start Development Environment

```bash
# Start all services (PostgreSQL, Redis, Gateway, 6 Services, Frontend)
docker compose -f infra/docker-compose.yml up --build
```

### Access Points

| Service | URL |
|---|---|
| API Gateway | `http://localhost:3000/api/v1` |
| Frontend | `http://localhost:5173` |
| Identity Service | `http://localhost:3001` |
| Site Service | `http://localhost:3002` |
| Data Service | `http://localhost:3003` |
| Media Service | `http://localhost:3004` |
| Notification Service | `http://localhost:3005` |
| AI Service | `http://localhost:3006` |
| PostgreSQL | `localhost:5432` |
| Redis | `localhost:6379` |

### Environment Variables

Copy and configure:
```bash
cp infra/.env.example infra/.env
```

Required variables:
- `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`
- `JWT_SECRET`
- `GEMINI_API_KEY`
- `AWS_S3_BUCKET`, `AWS_REGION`