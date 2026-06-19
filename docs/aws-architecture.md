# Genzite — AWS Solution Architecture & C4 Hybrid Diagram

> **Document Classification:** Technical Architecture — Presentation Grade
>
> **Audience:** CTO Review · Enterprise Architecture Board · Technical Defense · Investor Demo · Capstone Presentation
>
> **Stack:** NestJS 11+ · TypeScript · Node.js 22 LTS · Prisma · PostgreSQL · Redis · AWS · Google Gemini

---

## 1. C4 Level 1 — System Context Diagram

```mermaid
graph TB
    subgraph ACTORS["External Actors"]
        USER["👤 End User<br/>───────────<br/>Non-technical user<br/>creates applications<br/>via natural language"]
        ADMIN["🛡️ Platform Admin<br/>───────────<br/>Manages workspaces,<br/>users, and billing"]
    end

    subgraph SYSTEM["🏠 Genzite Platform"]
        direction TB
        CORE["🏗️ Genzite<br/>AI-Powered No-Code<br/>Application Builder<br/>───────────────────<br/>• AI App Generation<br/>• Dynamic CMS<br/>• Recruitment Intelligence<br/>• AI Resume Builder<br/>• Career Coaching<br/>• Media Management<br/>───────────────────<br/>NestJS Modular Monolith<br/>PostgreSQL + JSONB"]
    end

    subgraph EXTERNAL["External Systems"]
        GEMINI["🤖 Google Gemini API<br/>───────────<br/>LLM Provider<br/>Website / CMS / Resume<br/>Analysis & Generation"]
        S3EXT["📦 Amazon S3<br/>───────────<br/>Object Storage<br/>Media & Static Assets"]
        EMAIL["📧 Email Service<br/>───────────<br/>Transactional Email<br/>Notifications"]
    end

    USER -- "Creates apps via<br/>natural language prompts<br/>[HTTPS/REST]" --> CORE
    ADMIN -- "Manages platform<br/>configuration<br/>[HTTPS/REST]" --> CORE
    CORE -- "AI Generation &<br/>Analysis requests<br/>[HTTPS — 10-15s latency]" --> GEMINI
    CORE -- "Generates presigned<br/>upload/download URLs<br/>[AWS SDK]" --> S3EXT
    CORE -- "Sends notifications<br/>[SMTP/API]" --> EMAIL
    USER -- "Uploads media<br/>directly via<br/>presigned URL<br/>[HTTPS PUT]" --> S3EXT

    classDef actor fill:#dbeafe,stroke:#2563eb,stroke-width:2px,color:#1e3a8a
    classDef system fill:#dcfce7,stroke:#16a34a,stroke-width:3px,color:#14532d
    classDef ext fill:#fef3c7,stroke:#d97706,stroke-width:2px,color:#92400e

    class USER,ADMIN actor
    class CORE system
    class GEMINI,S3EXT,EMAIL ext
```

---

## 2. AWS Production Infrastructure Diagram

```mermaid
graph TD
    %% ════════════════════════════════════════════════
    %% CLIENT LAYER
    %% ════════════════════════════════════════════════
    subgraph CLIENT["🖥️  Client Layer"]
        BROWSER["👤 User Browser<br/>─────────────────<br/>React SPA · TypeScript<br/>├─ app-builder-canvas<br/>└─ app-cms-dashboard"]
    end

    %% ════════════════════════════════════════════════
    %% EXTERNAL AI
    %% ════════════════════════════════════════════════
    subgraph EXT_AI["🌐  External AI Service"]
        GEMINI["🤖 Google Gemini API<br/>─────────────────<br/>• Website Generation<br/>• CMS Generation<br/>• Content Generation<br/>• Resume Analysis<br/>• JD Analysis<br/>• Interview Generation<br/>• Skill Matching<br/>• Career Coaching"]
    end

    %% ════════════════════════════════════════════════
    %% AWS CLOUD
    %% ════════════════════════════════════════════════
    subgraph AWS["☁️  AWS Cloud"]

        %% ─── EDGE LAYER ───
        subgraph EDGE["🌍 Edge Layer — Global"]
            R53["🌍 Amazon Route 53<br/>─────────────────<br/>DNS Resolution<br/>Custom Domains<br/>Dynamic Routing<br/>Health Checks"]
            CF["⚡ Amazon CloudFront<br/>─────────────────<br/>CDN Distribution<br/>SSL/TLS Termination<br/>Edge Caching<br/>Target: 80-90% cache hit"]
        end

        %% ─── S3 STORAGE ───
        subgraph S3_LAYER["📦 Amazon S3 — Object Storage"]
            S3_FE["🗂️ S3 Frontend Bucket<br/>─────────────────<br/>React Production Builds<br/>Static Assets (CSS/JS)<br/>index.html + chunks<br/>─────────────────<br/>Access: CloudFront OAI only"]
            S3_MEDIA["🖼️ S3 Media Bucket<br/>─────────────────<br/>Images · Videos · PDFs<br/>CV Files · Generated Assets<br/>─────────────────<br/>Access: Presigned URLs<br/>Lifecycle: Std → IA → Glacier"]
        end

        %% ─── VPC ───
        subgraph VPC["🔒 VPC — 10.0.0.0/16"]

            %% PUBLIC SUBNETS
            subgraph PUB_SUB["📡 Public Subnets — AZ-a / AZ-b"]
                ALB["⚖️ Application Load Balancer<br/>─────────────────<br/>HTTPS :443<br/>SSL Termination<br/>Path-Based Routing<br/>Health Checks (/health)"]
                NAT["🔁 NAT Gateway<br/>─────────────────<br/>Outbound Internet Only<br/>⚠️ Production Only<br/>(Skip for MVP)"]
            end

            %% PRIVATE COMPUTE SUBNETS
            subgraph PRIV_COMPUTE["🖥️ Private Subnets — Compute — AZ-a / AZ-b"]
                subgraph ASG["EC2 Auto Scaling Group<br/>Graviton: t4g.small → t4g.large"]
                    EC2A["🟢 EC2 Instance — AZ-a<br/>Node.js 22 LTS<br/>NestJS 11+ Modular Monolith"]
                    EC2B["🟢 EC2 Instance — AZ-b<br/>Node.js 22 LTS<br/>NestJS 11+ Modular Monolith"]
                end

                subgraph NEST_MODULES["📦 NestJS Modular Monolith — Domain Modules"]
                    MOD_ID["🔐 identity<br/>─────────<br/>Auth · JWT<br/>RBAC · Workspace"]
                    MOD_SITE["🌐 site<br/>─────────<br/>App Config<br/>Publishing<br/>Domains"]
                    MOD_AI["🤖 ai<br/>─────────<br/>Gemini Client<br/>Generators<br/>Analyzers<br/>(Async Jobs)"]
                    MOD_DATA["📊 data<br/>─────────<br/>JSONB CMS<br/>Collections<br/>Forms"]
                    MOD_MEDIA["📎 media<br/>─────────<br/>Presigned URLs<br/>Asset Metadata"]
                    MOD_NOTIF["🔔 notification<br/>─────────<br/>Email · Push<br/>System Alerts"]
                end
            end

            %% PRIVATE DATA SUBNETS
            subgraph PRIV_DATA["💾 Private Subnets — Data — AZ-a / AZ-b"]
                RDS["🐘 Amazon RDS PostgreSQL<br/>Multi-AZ (Production)<br/>─────────────────<br/>Relational: Users, RBAC, Config<br/>JSONB: CMS, Resumes, JDs,<br/>Products, Orders, Collections<br/>─────────────────<br/>ORM: Prisma<br/>Entity: UserSiteRecord"]
                REDIS["⚡ Amazon ElastiCache Redis<br/>⚠️ Optional for MVP<br/>─────────────────<br/>Session Cache<br/>Query Cache<br/>AI Response Cache<br/>(Prompt Hash → Response)"]
            end

        end
    end

    %% ════════════════════════════════════════════════
    %% FLOW A — WEB & API REQUEST LIFECYCLE
    %% ════════════════════════════════════════════════
    BROWSER -- "A1 — DNS Lookup<br/>*.genzite.com" --> R53
    R53 -- "A2 — Resolve to<br/>CloudFront Distribution" --> CF
    CF -- "A3 — Forward /api/*<br/>to Origin" --> ALB
    ALB -- "A4 — Route to healthy<br/>instance (Round Robin)" --> EC2A
    ALB -- "A4 — Route to healthy<br/>instance (Round Robin)" --> EC2B
    EC2A -- "A5 — Prisma Queries<br/>SQL + JSONB<br/>port 5432" --> RDS
    EC2B -- "A5 — Prisma Queries<br/>SQL + JSONB<br/>port 5432" --> RDS
    EC2A -. "A6 — Session & Cache<br/>port 6379<br/>(when enabled)" .-> REDIS
    EC2B -. "A6 — Session & Cache<br/>port 6379<br/>(when enabled)" .-> REDIS

    %% ════════════════════════════════════════════════
    %% FLOW B — DIRECT MEDIA UPLOAD (BACKEND BYPASS)
    %% ════════════════════════════════════════════════
    BROWSER -. "B7 — POST /api/media/upload-url<br/>Request Presigned URL" .-> MOD_MEDIA
    MOD_MEDIA -. "B8 — Return S3<br/>Presigned PUT URL<br/>(time-limited)" .-> BROWSER
    BROWSER == "B9 — Direct PUT Upload<br/>to S3 (backend bypassed<br/>— zero EC2 load)" ==> S3_MEDIA

    %% ════════════════════════════════════════════════
    %% FLOW C — AI PROCESSING (ASYNC + ISOLATED)
    %% ════════════════════════════════════════════════
    MOD_AI -. "C10 — Outbound HTTPS<br/>⏱️ 10–15s Latency<br/>(Async Job / EventEmitter)<br/>via NAT Gateway" .-> NAT
    NAT -. "Outbound<br/>to Internet" .-> GEMINI

    %% ════════════════════════════════════════════════
    %% FLOW D — STATIC ASSET DELIVERY
    %% ════════════════════════════════════════════════
    CF -- "D11 — Origin Fetch<br/>(on Cache Miss)" --> S3_FE

    %% ════════════════════════════════════════════════
    %% INTERNAL LINKAGE
    %% ════════════════════════════════════════════════
    EC2A ~~~ NEST_MODULES

    %% ════════════════════════════════════════════════
    %% STYLES
    %% ════════════════════════════════════════════════
    classDef client fill:#fef3c7,stroke:#b45309,stroke-width:2px,color:#78350f
    classDef edge fill:#dbeafe,stroke:#1d4ed8,stroke-width:2px,color:#1e3a8a
    classDef s3 fill:#d1fae5,stroke:#047857,stroke-width:2px,color:#064e3b
    classDef compute fill:#ede9fe,stroke:#6d28d9,stroke-width:2px,color:#4c1d95
    classDef data fill:#fce7f3,stroke:#be185d,stroke-width:2px,color:#831843
    classDef external fill:#fee2e2,stroke:#b91c1c,stroke-width:2px,color:#7f1d1d
    classDef module fill:#ecfdf5,stroke:#059669,stroke-width:1.5px,color:#065f46
    classDef nat fill:#fefce8,stroke:#a16207,stroke-width:2px,color:#713f12

    class BROWSER client
    class R53,CF edge
    class S3_FE,S3_MEDIA s3
    class ALB,EC2A,EC2B compute
    class RDS,REDIS data
    class GEMINI external
    class MOD_ID,MOD_SITE,MOD_AI,MOD_DATA,MOD_MEDIA,MOD_NOTIF module
    class NAT nat
```

---

## 3. Business Capability Map

```mermaid
graph LR
    subgraph CAPABILITIES["🏢 Genzite Business Capabilities"]
        direction TB

        subgraph GEN["🏗️ Application Generation"]
            C1["AI Application<br/>Builder"]
            C2["Site Management<br/>& Publishing"]
        end

        subgraph CMS["📊 Content & Data"]
            C3["Dynamic CMS<br/>Engine"]
            C4["Data Collections<br/>& Forms"]
        end

        subgraph RECRUIT["🎯 Recruitment Intelligence"]
            C5["AI Resume<br/>Builder"]
            C6["AI CV & JD<br/>Analysis"]
            C7["AI Interview<br/>Generator"]
            C8["AI Career<br/>Coach"]
        end

        subgraph PLATFORM["⚙️ Platform Services"]
            C9["Identity &<br/>Access Control"]
            C10["Media<br/>Management"]
            C11["Notification<br/>Engine"]
        end
    end

    subgraph MODULES["📦 Backend Modules"]
        M_AI["ai"]
        M_SITE["site"]
        M_DATA["data"]
        M_ID["identity"]
        M_MEDIA["media"]
        M_NOTIF["notification"]
    end

    C1 --> M_AI
    C2 --> M_SITE
    C3 --> M_DATA
    C4 --> M_DATA
    C5 --> M_AI
    C6 --> M_AI
    C7 --> M_AI
    C8 --> M_AI
    C9 --> M_ID
    C10 --> M_MEDIA
    C11 --> M_NOTIF

    classDef cap fill:#f0f9ff,stroke:#0284c7,stroke-width:1.5px,color:#0c4a6e
    classDef mod fill:#ecfdf5,stroke:#059669,stroke-width:2px,color:#065f46

    class C1,C2,C3,C4,C5,C6,C7,C8,C9,C10,C11 cap
    class M_AI,M_SITE,M_DATA,M_ID,M_MEDIA,M_NOTIF mod
```

---

## 4. Module Decomposition — Event-Driven Communication

```mermaid
graph LR
    subgraph MONOLITH["NestJS Modular Monolith"]
        ID["🔐 identity<br/>───────────<br/>Users · Auth<br/>JWT · RBAC<br/>Workspaces"]

        SITE["🌐 site<br/>───────────<br/>Site Config<br/>Publishing<br/>Domains<br/>Themes"]

        AI["🤖 ai<br/>───────────<br/>GeminiClient<br/>WebsiteGenerator<br/>CMSGenerator<br/>ContentGenerator<br/>ResumeAnalyzer<br/>JDAnalyzer<br/>MatchingEngine<br/>InterviewGenerator<br/>CareerCoach"]

        DATA["📊 data<br/>───────────<br/>JSONB Engine<br/>Collections<br/>Forms<br/>Validation<br/>UserSiteRecord"]

        MEDIA["📎 media<br/>───────────<br/>Presigned URLs<br/>Asset Metadata<br/>S3 Integration"]

        NOTIF["🔔 notification<br/>───────────<br/>Email<br/>Push<br/>System Alerts"]
    end

    ID -. "UserRegistered<br/>(Event)" .-> NOTIF
    SITE -. "SiteGenerationRequested<br/>(Event)" .-> AI
    AI -. "SiteGenerated<br/>(Event)" .-> DATA
    AI -. "GenerationCompleted<br/>(Event)" .-> NOTIF
    DATA -. "RecordCreated<br/>(Event)" .-> NOTIF
    MEDIA -. "AssetUploaded<br/>(Interface)" .-> SITE

    classDef mod fill:#ecfdf5,stroke:#059669,stroke-width:2px,color:#065f46
    class ID,SITE,AI,DATA,MEDIA,NOTIF mod
```

> **Architectural Invariant:** Cross-domain `@Inject()` is strictly forbidden. All inter-module communication flows through `EventEmitter2` application events or shared domain interfaces. This preserves module boundaries and enables future service extraction.

---

## 5. Data Flow Sequences

### Flow A+C — AI Application Generation (End-to-End)

```mermaid
sequenceDiagram
    participant U as 👤 User Browser
    participant CF as ⚡ CloudFront
    participant ALB as ⚖️ ALB
    participant SITE as 🌐 site module
    participant AI as 🤖 ai module
    participant GEM as 🤖 Gemini API
    participant DATA as 📊 data module
    participant DB as 🐘 PostgreSQL
    participant CACHE as ⚡ Redis

    U->>CF: POST /api/sites/generate
    CF->>ALB: Forward API request
    ALB->>SITE: Route to instance

    SITE->>SITE: Validate request
    SITE-->>AI: Emit: SiteGenerationRequested

    Note over AI: Check prompt hash in cache
    AI->>CACHE: GET prompt_hash:abc123
    alt Cache Hit
        CACHE-->>AI: Return cached response
    else Cache Miss
        AI->>GEM: Generate website (10-15s)
        GEM-->>AI: Return generated structure
        AI->>CACHE: SET prompt_hash:abc123
    end

    AI-->>DATA: Emit: SiteGenerated
    DATA->>DB: INSERT UserSiteRecord (JSONB)
    DATA-->>SITE: Emit: RecordCreated

    SITE-->>U: 200 OK — Site ready
```

### Flow B — Direct Media Upload

```mermaid
sequenceDiagram
    participant U as 👤 User Browser
    participant ALB as ⚖️ ALB
    participant MEDIA as 📎 media module
    participant S3 as 🖼️ S3 Media Bucket

    U->>ALB: POST /api/media/upload-url
    ALB->>MEDIA: Route request
    MEDIA->>MEDIA: Generate Presigned PUT URL
    MEDIA-->>U: Return { url, fields, expiry }

    Note over U,S3: Direct upload — bypasses backend
    U->>S3: PUT file via Presigned URL
    S3-->>U: 200 OK — Upload complete
```

---

## 6. Network & Security Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                       AWS Cloud — Region                         │
│                                                                  │
│   🌍 Route 53 ──→ ⚡ CloudFront ──→ 📦 S3 (Frontend Bucket)     │
│                          │                                       │
│   ┌──────────────────────┼──── VPC 10.0.0.0/16 ────────────────┐│
│   │                      │                                     ││
│   │  ┌─── Public Subnets (10.0.1.0/24 · 10.0.2.0/24) ────┐   ││
│   │  │                                                     │   ││
│   │  │  ⚖️  ALB (HTTPS :443)    🔁 NAT GW (Prod only)     │   ││
│   │  │                                                     │   ││
│   │  └───────────────┬───────────────────┬─────────────────┘   ││
│   │                  │                   │                     ││
│   │  ┌─── Private Subnets — Compute (10.0.10.0/24) ───────┐   ││
│   │  │                                                     │   ││
│   │  │  🟢 EC2 ASG (NestJS Modular Monolith)               │   ││
│   │  │     ├─ identity  ├─ site   ├─ ai                    │   ││
│   │  │     ├─ data      ├─ media  └─ notification          │   ││
│   │  │                                                     │   ││
│   │  │  SG Inbound:  TCP 8080 from ALB SG only            │   ││
│   │  │  SG Outbound: TCP 443 → NAT GW (Gemini API)        │   ││
│   │  │               TCP 5432 → RDS SG                     │   ││
│   │  │               TCP 6379 → Redis SG                   │   ││
│   │  └───────────────┬───────────────────┬─────────────────┘   ││
│   │                  │                   │                     ││
│   │  ┌─── Private Subnets — Data (10.0.20.0/24) ──────────┐   ││
│   │  │                                                     │   ││
│   │  │  🐘 RDS PostgreSQL         ⚡ ElastiCache Redis     │   ││
│   │  │     Multi-AZ (Prod)           (Optional MVP)        │   ││
│   │  │     SG: 5432 from EC2         SG: 6379 from EC2    │   ││
│   │  │                                                     │   ││
│   │  └─────────────────────────────────────────────────────┘   ││
│   │                                                            ││
│   └────────────────────────────────────────────────────────────┘│
│                                                                  │
│   📦 S3 Media Bucket (Presigned URL access only)                 │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
          │
          │  Outbound HTTPS (via NAT GW)
          ▼
   🤖 Google Gemini API
```

### Security Group Rules

| Rule | Source | Destination | Port | Protocol | Notes |
|------|--------|-------------|------|----------|-------|
| ALB Ingress | `0.0.0.0/0` | ALB SG | 443 | HTTPS | Public internet |
| EC2 Ingress | ALB SG | EC2 SG | 8080 | HTTP | Internal only |
| RDS Ingress | EC2 SG | RDS SG | 5432 | TCP | Prisma connections |
| Redis Ingress | EC2 SG | Redis SG | 6379 | TCP | Cache R/W |
| AI Egress | EC2 SG | NAT GW | 443 | HTTPS | Gemini API calls |

### S3 Bucket Policies

| Bucket | Access Model | Notes |
|--------|-------------|-------|
| Frontend | CloudFront OAI | No public access; served only via CDN |
| Media | Presigned PUT/GET | Time-limited; per-object; no direct public access |

---

## 7. Data Flow Reference Table

| Flow | Step | Arrow | Path | Description |
|------|------|-------|------|-------------|
| **A** | 1 | `──▶` | Browser → Route 53 | DNS lookup `*.genzite.com` |
| **A** | 2 | `──▶` | Route 53 → CloudFront | Resolves to distribution endpoint |
| **A** | 3 | `──▶` | CloudFront → ALB | `/api/*` forwarded to origin |
| **A** | 4 | `──▶` | ALB → EC2 ASG | Round-robin to healthy NestJS instance |
| **A** | 5 | `◀─▶` | EC2 ↔ RDS PostgreSQL | Prisma queries: SQL + JSONB (port 5432) |
| **A** | 6 | `◀╌▶` | EC2 ↔ ElastiCache Redis | Session, query, AI cache (port 6379, optional MVP) |
| **B** | 7 | `╌─▶` | Browser → `media` module | `POST /api/media/upload-url` |
| **B** | 8 | `◀╌─` | `media` module → Browser | Returns presigned S3 PUT URL |
| **B** | 9 | `══▶` | Browser → S3 Media Bucket | **Direct upload — backend fully bypassed** |
| **C** | 10 | `╌─▶` | `ai` module → Gemini API | Async outbound via NAT GW (**⏱️ 10–15s latency**) |
| **D** | 11 | `──▶` | CloudFront → S3 Frontend | Origin fetch on cache miss (React SPA) |

---

## 8. Cost Optimization — MVP vs Production

| Component | MVP Mode | Production Mode |
|-----------|----------|-----------------|
| **Compute** | Single `t4g.small` (~$12/mo) | ASG `t4g.medium`–`t4g.large` Graviton |
| **Load Balancer** | ❌ Optional — direct EC2 | ✅ ALB with health checks |
| **NAT Gateway** | ❌ Skip — public subnet egress | ✅ Private subnet isolation |
| **RDS PostgreSQL** | Single-AZ `db.t4g.micro` (~$13/mo) | Multi-AZ `db.t4g.small`+ |
| **Redis** | ❌ Skip — app works without it | ✅ ElastiCache for session/AI cache |
| **CloudFront** | ✅ Free tier + minimal traffic | ✅ Full CDN distribution |
| **S3** | ✅ Standard tier only | ✅ Lifecycle: Standard → IA → Glacier |
| **AI Caching** | In-memory Map (basic) | Redis prompt-hash cache |
| **Estimated Cost** | **~$35–60/month** | **~$150–350/month** |

> **MVP is suitable for:** Development, Demo, Capstone Project, Early Launch
>
> **Production is suitable for:** Real Customers, High Availability, Traffic Growth

---

## 9. Platform Evolution Roadmap

```mermaid
graph LR
    subgraph P1["Phase 1 — Current"]
        MON["🏗️ Modular Monolith<br/>───────────────<br/>Single NestJS process<br/>6 domain modules<br/>Event-driven comms<br/>───────────────<br/>Team: 6 engineers"]
    end

    subgraph P2["Phase 2 — Scale Trigger"]
        SPLIT1["🏗️ Core Platform<br/>───────────<br/>identity · site<br/>data · media<br/>notification"]
        SPLIT2["🤖 AI Service<br/>───────────<br/>ai module<br/>Dedicated compute<br/>Auto-scaling"]
    end

    subgraph P3["Phase 3 — Full Scale"]
        S1["🔐 Identity<br/>Service"]
        S2["🌐 Platform<br/>Service"]
        S3["🤖 AI<br/>Service"]
        S4["📎 Media<br/>Service"]
    end

    MON -- "When AI load<br/>exceeds 40% CPU" --> SPLIT1
    MON -- "Extract first" --> SPLIT2
    SPLIT1 -- "When team<br/>grows to 15+" --> S1
    SPLIT1 --> S2
    SPLIT2 --> S3
    SPLIT1 --> S4

    classDef phase1 fill:#dcfce7,stroke:#16a34a,stroke-width:2px,color:#14532d
    classDef phase2 fill:#dbeafe,stroke:#2563eb,stroke-width:2px,color:#1e3a8a
    classDef phase3 fill:#fef3c7,stroke:#d97706,stroke-width:2px,color:#92400e

    class MON phase1
    class SPLIT1,SPLIT2 phase2
    class S1,S2,S3,S4 phase3
```

> **Do NOT prematurely split into microservices.** The modular monolith supports the current 6-person team efficiently. Extract services only when measurable bottlenecks emerge (AI CPU saturation, team coordination overhead, or independent scaling requirements).
