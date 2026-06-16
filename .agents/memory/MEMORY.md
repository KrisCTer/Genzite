# Memory Index

## Project
- [project] Always create a new dedicated branch for major code changes → project-conventions.md
- [project] Genzite is a NestJS microservices monorepo with 7 services → genzite-stack.md
- [project] All dynamic user data MUST use JSONB, never fixed SQL columns → genzite-stack.md
- [project] UI design must be cozy and home-oriented, reject harsh IT dashboards → genzite-stack.md

## Architecture
- [architecture] Domain rules in `/.ai/` take priority over AG Kit generic rules → genzite-stack.md
- [architecture] Services communicate via Kafka (async) or API Gateway (sync) → genzite-stack.md
- [architecture] AI service isolated with BullMQ workers for Gemini API calls → genzite-stack.md
- [architecture] Media uploads bypass backend: Presigned URL → S3 direct → genzite-stack.md
