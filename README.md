# Genzite – AI-Powered No-Code Business Application Builder & Dynamic CMS

## Overview

Genzite is an AI No-Code platform that enables users to create and operate fully functional web applications using natural language. Powered by Google Gemini, it automatically generates frontend interfaces, backend APIs, dynamic CMS structures, and AI-driven business features.

## Tech Stack

| Layer | Technology |
|---|---|
| **Backend** | NestJS (TypeScript, Modular Monolith) |
| **Frontend** | React + Vite + TypeScript + Tailwind CSS v4 |
| **Database** | PostgreSQL (Relational + JSONB) |
| **Cache** | Redis (Session + Query Cache) |
| **AI Engine** | Google Gemini API |
| **Cloud** | AWS (Route 53, CloudFront, S3, ALB, EC2, RDS, ElastiCache) |

## Repository Structure

```
genzite/
├── .ai/                 # AI agent rules & architectural guardrails
├── .cursorrules         # Agent entry-point directive
├── backend/             # NestJS Modular Monolith
│   └── src/
│       ├── identity/    # Auth, JWT, RBAC
│       ├── site/        # Sites, pages, widgets (canvas builder)
│       ├── data/        # Dynamic CMS collections & records (JSONB)
│       ├── media/       # S3 Presigned URL generation
│       ├── notification/# Emails, webhooks, push
│       └── ai/          # Google Gemini integration
├── frontend/            # React + Vite + Tailwind CSS
├── infra/               # Docker Compose (PostgreSQL, Redis, dev services)
├── docs/                # Product spec, DB design, API contracts
└── qa/                  # Functional API verification scripts
```

## Architecture Principles

1. **Modular Monolith**: Backend domains are strictly isolated. Cross-domain concrete DI is forbidden.
2. **JSONB-First Dynamic Data**: All user-generated CMS content uses PostgreSQL JSONB columns.
3. **S3 Direct Upload**: Media files bypass the backend entirely via Presigned URLs.
4. **AI Isolation**: Gemini API calls (10-15s) run in isolated contexts to avoid blocking core operations.
5. **Cozy Design**: UI must feel warm, friendly, and community-oriented — not a harsh IT dashboard.

## AI Agent Workflow

Any AI agent (Cursor, Claude, Antigravity, or others) **MUST** read all files under `/.ai/` and `/docs/` before proposing or generating implementation code.

## Development Setup

### Prerequisites
- Docker & Docker Compose
- Node.js 22+ (for local development without Docker)

### Start Development Environment

```bash
# Start all services (PostgreSQL, Redis, Backend, Frontend)
docker compose -f infra/docker-compose.yml up --build
```

### Access Points

| Service | URL |
|---|---|
| Backend API | `http://localhost:3000/api/v1` |
| Frontend | `http://localhost:5173` |
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