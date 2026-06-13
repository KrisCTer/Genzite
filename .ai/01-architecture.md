# Architecture Design

## Overview

Genzite is an AI-Powered No-Code Business Application Builder & Dynamic CMS. The system follows a **Modular Monolith** architecture with strict domain boundaries.

## System Topology

```mermaid
graph TB
    subgraph "Client Layer"
        FE_BUILDER["app-builder-canvas<br/>(React + Tailwind)"]
        FE_CMS["app-cms-dashboard<br/>(React + Tailwind)"]
    end

    subgraph "Edge / CDN"
        R53["Amazon Route 53<br/>(DNS + Custom Domain)"]
        CF["Amazon CloudFront<br/>(CDN)"]
        S3_FE["Amazon S3<br/>(Frontend Hosting)"]
        S3_MEDIA["Amazon S3<br/>(Media Storage)"]
    end

    subgraph "Load Balancing"
        ALB["Application Load Balancer<br/>(SSL Termination)"]
    end

    subgraph "Compute - EC2 Auto Scaling"
        BACKEND["NestJS Modular Monolith"]
    end

    subgraph "Backend Domains"
        IDENTITY["identity"]
        SITE["site"]
        DATA["data"]
        MEDIA["media"]
        NOTIFICATION["notification"]
        AI["ai"]
    end

    subgraph "Data Layer"
        RDS["Amazon RDS PostgreSQL<br/>(Relational + JSONB)"]
        REDIS["Amazon ElastiCache Redis<br/>(Session + Query Cache)"]
    end

    subgraph "External"
        GEMINI["Google Gemini API"]
    end

    R53 --> CF
    CF --> S3_FE
    CF --> ALB
    ALB --> BACKEND
    BACKEND --- IDENTITY
    BACKEND --- SITE
    BACKEND --- DATA
    BACKEND --- MEDIA
    BACKEND --- NOTIFICATION
    BACKEND --- AI
    BACKEND --> RDS
    BACKEND --> REDIS
    AI --> GEMINI
    FE_BUILDER -->|"Presigned URL Upload"| S3_MEDIA
    FE_CMS -->|"Presigned URL Upload"| S3_MEDIA
    FE_BUILDER -->|"REST API"| ALB
    FE_CMS -->|"REST API"| ALB
```

## Repository Structure

```
genzite/
├── .ai/                     # Mandatory AI agent rules & guardrails
│   ├── 01-architecture.md
│   ├── 02-backend-rules.md
│   ├── 03-frontend-rules.md
│   └── 04-qa-rules.md
├── backend/                 # NestJS Modular Monolith
│   └── src/
│       ├── identity/        # Auth, JWT, RBAC
│       ├── site/            # Site canvas, pages, widgets
│       ├── data/            # Dynamic CMS collections & records (JSONB)
│       ├── media/           # S3 Presigned URL generation
│       ├── notification/    # Email, webhooks, push
│       └── ai/              # Google Gemini integration
├── frontend/                # React + Vite + TypeScript + Tailwind CSS
│   └── src/
│       ├── components/      # Reusable UI components
│       ├── pages/           # Route-level views
│       ├── hooks/           # Custom React hooks
│       ├── context/         # Global state providers
│       └── services/        # API client layer
├── infra/                   # Docker Compose for local development
├── docs/                    # Product spec, DB design, API contracts
├── qa/                      # Functional API verification scripts
└── .cursorrules             # AI agent entry-point directive
```

## Modular Monolith Guardrails

### Domain Isolation
Each backend domain (`identity`, `site`, `data`, `media`, `notification`, `ai`) is a self-contained NestJS Module. Domains must:
- **Export only interfaces/abstractions**, not concrete services.
- **Never inject concrete classes** from another domain.
- **Communicate cross-domain** via NestJS EventEmitter (application events) or exported interfaces only.

### LLM Isolation
The `ai` module handles Google Gemini API calls which may take 10–15 seconds. This module must be logically isolated so that long-running AI calls never block core CRUD operations in other domains.

### Media Upload Path
Media file uploads **bypass the backend entirely**. The `media` module only generates **Presigned URLs** for Amazon S3. The frontend uploads directly to S3 using those URLs, then notifies the backend of the completed upload via a metadata callback endpoint.

### Data Layer Split
| Data Type | Storage Strategy |
|---|---|
| System config, Users, Roles, Permissions, Site metadata | Standard PostgreSQL relational tables |
| User-generated CMS content, dynamic business objects, resume data | PostgreSQL `JSONB` columns |

> **RULE**: NEVER create fixed SQL columns or migrations for dynamic user data fields. All dynamic content MUST use JSONB.

## Design Philosophy

The UI/UX aesthetic MUST be **cozy, user-friendly, and home-oriented**. Strictly reject harsh, technical, or traditional IT-dashboard designs. The platform should feel like a welcoming community tool, not a developer console.
