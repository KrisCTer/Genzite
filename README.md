# Genzite Monorepo

Genzite is organized as a strict monorepo for an AI-agent-driven development workflow.

## Repository Architecture

- **`/backend`**: Java 17+ Spring Boot 3 Modular Monolith blueprint.
  - Multi-module Maven structure.
  - Domain modules communicate through interfaces.
  - Dynamic CMS records are designed for PostgreSQL JSONB storage.
- **`/frontend`**: React workspace for separated product surfaces.
  - `app-builder-canvas` for no-code site composition.
  - `app-cms-dashboard` for dynamic content management workflows.
- **`/infra`**: Local infrastructure bootstrap (PostgreSQL + Redis).
- **`/qa`**: Verify-command-based functional QA scripts (non-UI).
- **`/.ai`** and **`/docs`**: Mandatory source-of-truth constraints and product specifications for AI agents.

## Strict Agent Workflow

Any AI agent (Cursor, Claude, Antigravity, or others) must read all files under `/.ai` and `/docs` before proposing or generating implementation code.

## Design Principles

1. Modular Monolith backend with strict domain boundaries.
2. Cross-domain concrete dependency injection is forbidden.
3. Cross-domain communication must happen through interfaces.
4. Dynamic user-generated CMS data must remain JSONB-based.
5. QA automation focuses on command-verifiable backend behavior, excluding UI visual testing.
