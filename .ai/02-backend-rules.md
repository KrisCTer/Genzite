# Backend Rules (NestJS Modular Monolith)

All backend code resides in `/backend` and follows strict NestJS + TypeScript Modular Monolith conventions.

## Tech Stack
- **Runtime**: Node.js (LTS)
- **Framework**: NestJS
- **Language**: TypeScript (strict mode)
- **ORM**: Prisma (PostgreSQL)
- **Cache**: Redis via `@nestjs/cache-manager`
- **Auth**: JWT (`@nestjs/jwt` + `@nestjs/passport`)
- **Validation**: `class-validator` + `class-transformer`
- **Config**: `@nestjs/config` (.env-driven)

## Module Structure

Each domain module (`identity`, `site`, `data`, `media`, `notification`, `ai`) must follow this directory layout:

```
<domain>/
├── <domain>.module.ts        # NestJS Module declaration
├── <domain>.controller.ts    # HTTP route handlers
├── <domain>.service.ts       # Core business logic
├── dto/                      # Request/Response validation classes
│   └── <action>.dto.ts
├── entities/                 # Prisma model interfaces or type definitions
│   └── <entity>.entity.ts
└── interfaces/               # Exported abstractions for cross-domain use
    └── <domain>.interface.ts
```

## Modular Monolith Rules

### Cross-Domain Dependency Injection: FORBIDDEN
- Modules must **never** import another domain's concrete service via `@Inject()`.
- Cross-domain communication MUST happen via:
  1. **Exported Interfaces** from the `interfaces/` directory.
  2. **NestJS EventEmitter** for async domain events.
- Example: The `site` module must not inject `IdentityService` directly. Instead, it should depend on an `IUserLookup` interface exported from `identity`.

### Controller Rules
- Controllers handle ONLY routing, parameter extraction, and HTTP response formatting.
- ALL business logic, database queries, and transformations belong in **Services**.
- Request DTOs MUST use `class-validator` decorators for payload validation.
- Enable `ValidationPipe` globally:
  ```typescript
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  ```

### Service Rules
- Use Constructor Injection exclusively.
- Never expose raw Prisma client or database connections outside a service.
- Wrap all Prisma calls inside service methods.

### API Prefix
- All routes MUST be prefixed with `/api/v1`.
- Set globally via `app.setGlobalPrefix('api/v1')`.

## Data Layer Rules

### Relational Data (Standard Tables)
Use standard Prisma schema models for:
- `User`, `Role`, `Permission`
- `Site`, `Page`, `Widget` metadata
- `Media` file registry

### Dynamic CMS Data (JSONB)
- All user-generated content and dynamic business objects MUST use PostgreSQL `JSONB` columns.
- Primary entities: `CmsCollection` (schema definition) and `CmsRecord` (data payload).
- **RULE**: NEVER suggest creating fixed SQL columns or Prisma migrations for dynamic user data fields.
- **RULE**: NEVER use Flyway or manual DDL for user-content schema changes.

### Resume & Recruitment Data
- `Resume.parsed_profile` → JSONB (structured experience, skills, contact)
- `Resume.ats_scores` → JSONB (JD-matched scoring breakdown)
- `InterviewSession.dialogue_history` → JSONB (AI conversation log)
- `InterviewSession.evaluation` → JSONB (grades, feedback, study map)

## AI Module Isolation
- The `ai` module calls Google Gemini API, which can take 10–15 seconds per request.
- This module MUST be logically isolated to prevent blocking core CRUD operations.
- Consider using NestJS queues (`@nestjs/bull`) for long-running AI tasks in production.
- Never call Gemini API synchronously inside identity, site, or data module controllers.

## Media Upload Rules
- The backend NEVER receives file binary data directly.
- The `media` module generates **Presigned URLs** for Amazon S3.
- The frontend uploads files directly to S3, then calls a backend callback to register metadata.

## Configuration & Environment
- Use `@nestjs/config` with `.env` files for all environment-specific values.
- Never hardcode credentials, API keys, ports, or bucket names.
- Required env vars: `DATABASE_URL`, `REDIS_HOST`, `REDIS_PORT`, `JWT_SECRET`, `GEMINI_API_KEY`, `AWS_S3_BUCKET`, `AWS_REGION`.
