---
type: project
created: 2026-06-16
updated: 2026-06-16
---

# Genzite Tech Stack & Conventions

## Platform
- **Type**: AI-Powered No-Code Business Application Builder & Dynamic CMS
- **Monorepo**: npm workspaces (`apps/*`, `packages/*`)

## Backend (NestJS Microservices)
- **7 Services**: gateway (3000), identity (3001), site (3002), data (3003), media (3004), notification (3005), ai (3006)
- **ORM**: Prisma (PostgreSQL)
- **Cache**: Redis via `@nestjs/cache-manager`
- **Auth**: JWT (`@nestjs/jwt` + `@nestjs/passport`)
- **Validation**: `class-validator` + `class-transformer`
- **API Prefix**: `/api/v1` (global)

## Frontend
- **Stack**: React 18+ / Vite / TypeScript / Tailwind CSS v4
- **State**: React Context + custom hooks (Zustand for complex state)
- **Two surfaces**: App Builder Canvas + App CMS Dashboard

## Critical Rules
1. Each service has its own PostgreSQL schema — NO cross-DB access
2. Cross-service: Kafka events (async) or API Gateway (sync)
3. Dynamic data → JSONB columns. NEVER fixed SQL columns for user data
4. Media → S3 Presigned URLs. Backend NEVER receives file binaries
5. AI (Gemini API) → Isolated in ai-service with BullMQ workers
6. UI → Cozy, warm, home-oriented. REJECT harsh IT dashboards
7. QA → Backend API testing only. NO UI testing

## Domain Rules Location
- Full specs: `/.ai/01-architecture.md` through `/.ai/04-qa-rules.md`
- Product docs: `/docs/`
- These ALWAYS take priority over generic AG Kit rules
