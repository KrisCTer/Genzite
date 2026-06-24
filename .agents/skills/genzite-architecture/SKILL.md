---
name: genzite-architecture
description: Genzite-specific architecture rules, microservices conventions, NestJS patterns, and domain knowledge. This skill MUST be loaded for any task involving the Genzite project.
when_to_use: "ALWAYS load this skill when working in the Genzite project. Contains project-specific rules that OVERRIDE generic AG Kit guidance."
allowed-tools: Read, Glob, Grep, Write, Edit
---

# Genzite Domain Knowledge

> **PRIORITY**: Rules in this skill take precedence over all generic AG Kit skills when working in the Genzite project.

## 🎯 Selective Reading Rule

**Read the `.ai/` directory files for full specification!** This skill is a summary index.

| File | Description | When to Read |
|------|-------------|--------------|
| `/.ai/01-architecture.md` | System topology, 7 microservices, service structure | Any architectural work |
| `/.ai/02-backend-rules.md` | NestJS + Prisma + JSONB conventions | Backend development |
| `/.ai/03-frontend-rules.md` | React + Vite + Tailwind CSS v4, cozy design | Frontend development |
| `/.ai/04-qa-rules.md` | QA testing rules (backend API only) | Writing/reviewing tests |
| `/docs/` | Product spec, DB design, API contracts | Feature implementation |

---

## 🏗️ System Overview

Genzite is an **AI-Powered No-Code Business Application Builder & Dynamic CMS**.

### Tech Stack
- **Backend**: NestJS Microservices (7 services, TypeScript)
- **Frontend**: React + Vite + TypeScript + Tailwind CSS v4
- **Database**: PostgreSQL (Relational + JSONB) + Redis (Cache + Queue)
- **AI Engine**: Google Gemini API + Model Context Protocol (MCP) + Multi-Agent System
- **Cloud**: AWS (Route 53, CloudFront, S3, ALB, EC2, RDS, ElastiCache)

### Microservices Map
| Service | Port | Domain |
|---------|------|--------|
| `apps/gateway` | 3000 | API Gateway, JWT, Rate Limiting |
| `apps/identity-service` | 3001 | Auth, JWT, RBAC |
| `apps/site-service` | 3002 | Sites, Pages, Widgets (Canvas Builder) |
| `apps/data-service` | 3003 | Dynamic CMS Collections & Records (JSONB) |
| `apps/media-service` | 3004 | S3 Presigned URL generation |
| `apps/notification-service` | 3005 | Email, Push, In-App |
| `apps/ai-service` | 3006 | Multi-Agent System (Chat, Plan, UI), Pipeline Engine, MCP Server/Client |

---

## 🔴 Critical Architecture Rules

1. **Service Isolation**: Each service has its own DB schema. Services NEVER access each other's DB directly.
2. **Cross-Service Communication**: Kafka events (async) or API Gateway proxy (sync). NEVER direct service imports.
3. **JSONB-First**: All dynamic user data MUST use PostgreSQL JSONB. NEVER create fixed columns for dynamic fields.
4. **S3 Direct Upload**: Media uploads bypass backend entirely (Presigned URL → S3 → metadata callback).
5. **AI Isolation & Agents**: Gemini API calls run in `ai-service` via a Multi-Agent architecture with MCP integration. Long-running tasks use BullMQ workers. NEVER call synchronously from other services.
6. **QA Scope**: 100% functional backend API verification. UI testing is STRICTLY EXCLUDED.
7. **Design Philosophy**: UI MUST be cozy, user-friendly, and home-oriented. REJECT harsh IT-dashboard designs.

---

## 🔗 Related AG Kit Skills

| Skill | Relevance to Genzite |
|-------|-----------------------|
| `@[skills/nodejs-best-practices]` | NestJS backend patterns |
| `@[skills/database-design]` | PostgreSQL + JSONB schema |
| `@[skills/api-patterns]` | REST API design |
| `@[skills/tailwind-patterns]` | Tailwind CSS v4 frontend |
| `@[skills/testing-patterns]` | Backend API testing |
| `@[skills/deployment-procedures]` | AWS deployment |
| `@[skills/vulnerability-scanner]` | Security scanning |

---

## Validation Checklist

Before finalizing any Genzite code:

- [ ] Follows NestJS module structure (controller → service → dto → entity)
- [ ] No cross-service DB access
- [ ] Dynamic data uses JSONB (not fixed columns)
- [ ] Media uploads use Presigned URL flow
- [ ] AI calls are async (BullMQ workers)
- [ ] API routes prefixed with `/api/v1`
- [ ] Frontend design is cozy and warm (not harsh/technical)
- [ ] All env vars from `@nestjs/config` (no hardcoded values)
