# 🛠️ Hướng dẫn phát triển Genzite (Development Guide)

> Tài liệu này dành cho **tất cả thành viên** trong team. Đọc từ đầu đến cuối để có thể chạy dự án trên máy local.

---

## 📋 Mục lục

1. [Yêu cầu hệ thống](#1-yêu-cầu-hệ-thống)
2. [Clone & Cài đặt](#2-clone--cài-đặt)
3. [Cấu hình Environment](#3-cấu-hình-environment)
4. [Khởi động Infrastructure](#4-khởi-động-infrastructure-docker)
5. [Database Migration](#5-database-migration-prisma)
6. [Chạy Backend](#6-chạy-backend)
7. [Chạy Frontend](#7-chạy-frontend)
8. [Kiến trúc tổng quan](#8-kiến-trúc-tổng-quan)
9. [Lệnh thường dùng](#9-lệnh-thường-dùng-cheat-sheet)
10. [Xử lý lỗi thường gặp](#10-xử-lý-lỗi-thường-gặp)

---

## 1. Yêu cầu hệ thống

Cài đặt các công cụ sau trước khi bắt đầu:

| Tool | Version | Download | Kiểm tra |
|------|---------|----------|----------|
| **Node.js** | ≥ 18 | [nodejs.org](https://nodejs.org/) | `node -v` |
| **npm** | ≥ 9 | Đi kèm Node.js | `npm -v` |
| **Docker Desktop** | Latest | [docker.com](https://www.docker.com/products/docker-desktop/) | `docker -v` |
| **Git** | Latest | [git-scm.com](https://git-scm.com/) | `git -v` |

> **⚠️ Windows**: Đảm bảo Docker Desktop đã bật **WSL 2 backend** trong Settings → General.

---

## 2. Clone & Cài đặt

```bash
# Clone repo
git clone <repo-url> Genzite
cd Genzite

# Cài dependencies toàn bộ monorepo (1 lần duy nhất)
npm install

# Build shared packages (BẮT BUỘC — các service phụ thuộc vào đây)
npm run build:packages
```

> **📝 Lưu ý**: Dự án dùng [npm workspaces](https://docs.npmjs.com/cli/using-npm/workspaces). Chạy `npm install` ở root sẽ cài cho TẤT CẢ apps + packages cùng lúc.

---

## 3. Cấu hình Environment

Dự án dùng **1 file `.env` chung duy nhất** nằm trong `infra/`:

```bash
# Copy file mẫu
cp infra/.env.example infra/.env
```

Nội dung mặc định đã đủ cho dev local. **Không cần sửa gì** trừ khi bạn muốn đổi password DB hoặc thêm API key:

```env
# infra/.env — Các giá trị mặc định

# PostgreSQL
POSTGRES_USER=genzite_user
POSTGRES_PASSWORD=genzite_password
POSTGRES_DB=genzite_dev
POSTGRES_HOST=localhost
POSTGRES_PORT=5432

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Kafka
KAFKA_BROKERS=localhost:29092

# Auth (AUTH_BYPASS=true → không cần chạy identity-service)
AUTH_BYPASS=true
JWT_SECRET=dev-jwt-secret-change-in-production-please

# AI (điền key nếu cần test AI features)
GEMINI_API_KEY=your-google-gemini-api-key

# AWS S3 (điền nếu cần test upload)
AWS_S3_BUCKET=genzite-media-dev
AWS_REGION=ap-southeast-1
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
```

### ❓ Tại sao chỉ 1 file `.env`?

Script `scripts/dev.mjs` sẽ:
1. Đọc `infra/.env`
2. Tự động build `DATABASE_URL` đúng schema cho từng service:
   - site-service → `postgresql://...?schema=site`
   - data-service → `postgresql://...?schema=data`
   - v.v...
3. Inject tất cả biến vào process khi chạy

→ **Không cần tạo `.env` riêng trong từng service.**

---

## 4. Khởi động Infrastructure (Docker)

> **Bước này chạy PostgreSQL, Redis, Kafka** — là nền tảng cho tất cả backend services.

```bash
cd infra
docker compose up -d db cache zookeeper kafka
```

Đợi khoảng 30 giây, rồi kiểm tra:

```bash
docker compose ps
```

Kết quả mong đợi — tất cả phải ở trạng thái `healthy`:

```
NAME                STATUS
genzite-db          Up (healthy)
genzite-cache       Up (healthy)
genzite-zookeeper   Up (healthy)
genzite-kafka       Up (healthy)
```

> **⚠️ Nếu Kafka chưa healthy**: Đợi thêm 30-60 giây — Kafka cần thời gian start lâu hơn.

### Dừng Infrastructure

```bash
cd infra
docker compose down          # Dừng nhưng giữ data
docker compose down -v       # Dừng VÀ XÓA toàn bộ data (reset DB)
```

---

## 5. Database Migration (Prisma)

> **Tạo tables trong PostgreSQL** từ Prisma schema. Chỉ cần chạy 1 lần (hoặc khi schema thay đổi).

```bash
# Từ thư mục ROOT của dự án (không phải trong infra/)
cd ..  # hoặc cd Genzite

# Migrate TẤT CẢ 6 services
npm run prisma:migrate
```

Prisma sẽ hỏi tên migration cho mỗi service → nhập: `init` (hoặc tên mô tả thay đổi).

### Migrate từng service riêng lẻ

```bash
npm run prisma:migrate:site
npm run prisma:migrate:data
npm run prisma:migrate:media
npm run prisma:migrate:notification
npm run prisma:migrate:ai
npm run prisma:migrate:identity
```

### Khi nào cần chạy lại?

| Tình huống | Lệnh |
|------------|------|
| Sửa file `schema.prisma` | `npm run prisma:migrate` |
| Pull code mới có migration | `npm run prisma:migrate` |
| Chỉ cần generate client (không tạo migration) | `npm run prisma:generate` |

---

## 6. Chạy Backend

### 🔹 Cách 1: Local Dev (KHUYÊN DÙNG)

Mỗi lệnh mở **1 terminal riêng** (hoặc dùng split terminal trong VS Code):

```bash
# Terminal 1 — API Gateway (port 3000)
npm run dev:gateway

# Terminal 2 — Site Service (port 3002)
npm run dev:site

# Terminal 3 — Data Service (port 3003)
npm run dev:data

# Terminal 4 — Media Service (port 3004)
npm run dev:media

# Terminal 5 — Notification Service (port 3005)
npm run dev:notification

# Terminal 6 — AI Service (port 3006)
npm run dev:ai
```

> **💡 Không cần chạy tất cả cùng lúc!** Nếu bạn chỉ làm site-service, chỉ cần chạy `dev:gateway` + `dev:site`.

> **⏸️ Identity Service (port 3001)** — Chưa cần chạy. Gateway có `AUTH_BYPASS=true`, tự gắn mock user (role ADMIN) vào mọi request.

### 🔹 Cách 2: Docker Compose (full stack)

```bash
cd infra
docker compose up -d
```

Khởi động **tất cả**: DB + Redis + Kafka + 7 backend services + Frontend.

### Khi nào dùng cách nào?

| Tình huống | Cách |
|------------|------|
| Đang code/debug service của mình | **Local Dev** (hot-reload nhanh) |
| Cần test API liên service | **Local Dev** (chạy 2-3 services liên quan) |
| Demo / integration test toàn bộ | **Docker Compose** |

---

## 7. Chạy Frontend

```bash
# Terminal riêng
npm run dev:frontend
```

Mở trình duyệt: **http://localhost:5173**

Frontend sẽ gọi API qua Gateway tại `http://localhost:3000/api/v1/...`

---

## 8. Kiến trúc tổng quan

### Request Flow

```
Browser (http://localhost:5173)
    ↓
API Gateway (:3000)
    ├── AuthMiddleware (bypass → mock user ADMIN)
    ├── /api/v1/sites/*         → Site Service (:3002)
    ├── /api/v1/cms/*           → Data Service (:3003)
    ├── /api/v1/media/*         → Media Service (:3004)
    ├── /api/v1/notifications/* → Notification Service (:3005)
    ├── /api/v1/ai/*            → AI Service (:3006)
    └── /api/v1/auth/*          → Identity Service (:3001) [chưa chạy]
```

### Cấu trúc thư mục

```
Genzite/
├── apps/                    # Các ứng dụng (services + frontend)
│   ├── gateway/             # API Gateway — proxy + auth
│   ├── identity-service/    # Auth, JWT, RBAC
│   ├── site-service/        # Sites, Pages, Widgets
│   ├── data-service/        # Dynamic CMS (JSONB)
│   ├── media-service/       # File upload, S3
│   ├── notification-service/# Email, Push, In-App
│   ├── ai-service/          # Gemini AI, Resume, Interview
│   └── frontend/            # React + Vite + Tailwind
│
├── packages/                # Shared libraries
│   ├── shared-types/        # DTOs, Kafka events, constants
│   ├── shared-utils/        # JWT helpers, pagination, validation
│   └── shared-ui/           # React components dùng chung
│
├── infra/                   # Infrastructure
│   ├── .env                 # ⭐ Config chung (KHÔNG commit)
│   ├── .env.example         # Template cho team copy
│   └── docker-compose.yml   # PostgreSQL, Redis, Kafka, services
│
├── scripts/
│   └── dev.mjs              # Dev CLI — chạy services với shared .env
│
├── package.json             # Root workspace + npm scripts
└── DEVELOPMENT.md           # 📖 File này!
```

### Database Schema Isolation

Mỗi service dùng 1 PostgreSQL schema riêng (cùng 1 database):

| Service | Schema | Tables |
|---------|--------|--------|
| identity-service | `identity` | users, roles, permissions, refresh_tokens |
| site-service | `site` | sites, pages, widgets |
| data-service | `data` | cms_collections, cms_records |
| media-service | `media` | media_files, media_folders, media_tags |
| notification-service | `notification` | notifications, notification_templates |
| ai-service | `ai` | resumes, interview_sessions, ai_task_logs |

---

## 9. Lệnh thường dùng (Cheat Sheet)

### Setup ban đầu

```bash
npm install                   # Cài dependencies
npm run build:packages        # Build shared packages
cp infra/.env.example infra/.env  # Tạo file config
```

### Docker

```bash
cd infra
docker compose up -d db cache zookeeper kafka   # Bật infra
docker compose ps                                # Xem status
docker compose logs -f kafka                     # Xem logs Kafka
docker compose down                              # Dừng
docker compose down -v                           # Dừng + xóa data
```

### Prisma (Database)

```bash
npm run prisma:migrate              # Migrate tất cả services
npm run prisma:migrate:site         # Migrate chỉ site-service
npm run prisma:generate             # Generate Prisma Client tất cả
```

### Chạy Services

```bash
npm run dev:gateway                 # Gateway (:3000)
npm run dev:site                    # Site Service (:3002)
npm run dev:data                    # Data Service (:3003)
npm run dev:media                   # Media Service (:3004)
npm run dev:notification            # Notification (:3005)
npm run dev:ai                      # AI Service (:3006)
npm run dev:frontend                # Frontend (:5173)
```

### Dev CLI (nâng cao)

```bash
node scripts/dev.mjs prisma migrate dev -s site-service    # Migrate 1 service
node scripts/dev.mjs prisma generate --all                 # Generate tất cả
node scripts/dev.mjs start:dev -s data-service             # Chạy 1 service
```

### Build & Test

```bash
npm run build:all                   # Build tất cả workspaces
npm run test:all                    # Test tất cả workspaces
```

---

## 10. Xử lý lỗi thường gặp

### ❌ `npm install` lỗi

```bash
# Xóa node_modules và lock file, cài lại
rm -rf node_modules package-lock.json
npm install
```

### ❌ Docker container không healthy

```bash
# Xem logs chi tiết
cd infra
docker compose logs db        # Lỗi PostgreSQL
docker compose logs kafka     # Lỗi Kafka

# Reset hoàn toàn
docker compose down -v
docker compose up -d db cache zookeeper kafka
```

### ❌ Prisma migrate lỗi "database does not exist"

```bash
# Đảm bảo PostgreSQL đang chạy
docker compose ps  # db phải healthy

# Nếu vẫn lỗi, reset DB
cd infra
docker compose down -v
docker compose up -d db cache zookeeper kafka
# Đợi 10 giây
npm run prisma:migrate
```

### ❌ "Cannot find module @genzite/shared-types"

```bash
# Build lại shared packages
npm run build:packages
```

### ❌ Port đã bị chiếm

```bash
# Windows — tìm process đang dùng port (ví dụ 3000)
netstat -ano | findstr :3000
# Kết quả dòng cuối là PID → kill nó
taskkill /PID <pid> /F
```

### ❌ PowerShell execution policy error

```bash
# Dùng cmd thay PowerShell, hoặc:
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

---

## Liên hệ

Nếu vẫn gặp lỗi không giải quyết được, liên hệ team lead hoặc mở issue trên repo.
