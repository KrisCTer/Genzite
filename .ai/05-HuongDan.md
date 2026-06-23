# Hướng dẫn Cài đặt & Chạy Dự án Genzite

Dự án Genzite được xây dựng dưới dạng Monorepo sử dụng **pnpm workspaces**, với hệ sinh thái bao gồm nhiều Microservices (NestJS), Frontend, cùng với hệ quản trị cơ sở dữ liệu Postgres (Prisma) và Event Broker (Kafka).

Dưới đây là các bước chi tiết để thiết lập môi trường và chạy dự án trên máy của bạn.

---

## 1. Yêu cầu Hệ thống (Prerequisites)

Trước khi bắt đầu, đảm bảo máy tính của bạn đã cài đặt các công cụ sau:
- **Node.js**: Phiên bản 18.x hoặc 20.x trở lên.
- **pnpm**: Bắt buộc dùng `pnpm` (Không dùng `npm` hay `yarn` do đây là pnpm workspace). Phiên bản 8.x hoặc mới nhất.
- **Docker & Docker Compose**: Để chạy cơ sở dữ liệu PostgreSQL, Kafka, và Redis.
- **TypeScript**: Cài đặt global (tùy chọn) `npm install -g typescript`.

---

## 2. Cài đặt Dependencies

Tại thư mục gốc của dự án (`F:\aws\Genzite`), mở Terminal (khuyến nghị dùng Command Prompt, Git Bash hoặc WSL nếu gặp lỗi Execution Policy với PowerShell) và chạy lệnh sau để cài đặt toàn bộ thư viện cho tất cả các packages/apps:

```bash
pnpm install --no-frozen-lockfile
```
*Lưu ý: Nếu dùng PowerShell và bị chặn bởi `AuthorizationManager`, hãy chạy lệnh với quyền bypass: `powershell.exe -ExecutionPolicy Bypass -Command "pnpm install"`.*

---

## 3. Khởi tạo Cơ sở dữ liệu & Prisma

Dự án sử dụng kiến trúc Database per Service (hoặc Schema Isolation qua Prisma).

### Cập nhật Prisma Client (Tất cả services)
Sau khi cài đặt dependencies hoặc khi có sự thay đổi trong bất kỳ file `schema.prisma` nào, hãy chạy lệnh sau để generate lại Prisma Client:

```bash
pnpm run prisma:generate
```

### Chạy Migration (Database Sync)
Đảm bảo Container Database đã được khởi động, sau đó chạy lệnh để apply migration (đồng bộ schema) cho toàn bộ services:

```bash
pnpm run prisma:migrate
```
*Lưu ý: Bạn cũng có thể chạy riêng cho từng service khi cần, ví dụ:*
- `pnpm run prisma:migrate:data`
- `pnpm run prisma:migrate:identity`

---

## 4. Build các Thư viện dùng chung (Packages)

Trước khi khởi chạy các ứng dụng, bạn cần phải build các packages dùng chung nội bộ (`shared-types`, `shared-utils`, `kafka`) để TypeScript nhận dạng và các ứng dụng có thể import chúng thành công.

```bash
pnpm run build:packages
```

---

## 5. Khởi chạy Ứng dụng (Development Mode)

Genzite cung cấp bộ script tùy chỉnh (thông qua `scripts/dev.mjs`) để khởi động từng microservice một cách dễ dàng.

### Chạy các Microservices (Backend)
Mở các tab terminal riêng biệt và chạy các lệnh tương ứng cho các service bạn muốn khởi động:

- **Identity Service**: `pnpm run dev:identity`
- **Data Service**: `pnpm run dev:data`
- **Site Service**: `pnpm run dev:site`
- **Media Service**: `pnpm run dev:media`
- **AI Service**: `pnpm run dev:ai`
- **Notification Service**: `pnpm run dev:notification`
- **API Gateway**: `pnpm run dev:gateway`

### Chạy Frontend UI
Dự án cung cấp các script sau để chạy phía Frontend:
- **Frontend App**: `pnpm run dev:frontend`
- **Shared UI (Storybook/Viewer)**: `pnpm run dev:ui`

---

## 6. Build Toàn bộ Project (Production Mode)

Để build toàn bộ hệ thống chuẩn bị cho việc deploy lên production, sử dụng lệnh:

```bash
pnpm run build:all
```

Để chạy bộ kiểm thử toàn hệ thống:
```bash
pnpm run test:all
```

---

## 7. Các lỗi thường gặp (Troubleshooting)

1. **Lỗi `Cannot find module 'X'` hoặc gạch đỏ trên IDE:**
   - **Nguyên nhân:** Có thể bạn vừa cài đặt thêm package mới nhưng IDE/TypeScript Server chưa cập nhật.
   - **Khắc phục:** Mở Command Palette trên VSCode (`Ctrl + Shift + P`), gõ và chọn lệnh `TypeScript: Restart TS server`.

2. **Lỗi `AuthorizationManager check failed` trên PowerShell:**
   - **Nguyên nhân:** PowerShell hạn chế thực thi script (`npx`, `pnpm.ps1`) theo chính sách bảo mật mặc định trên Windows.
   - **Khắc phục:** Mở PowerShell bằng quyền Administrator và chạy `Set-ExecutionPolicy RemoteSigned`, hoặc đơn giản là dùng `cmd` thay thế.

3. **Lỗi `PrismaClientInitializationError` / Từ chối kết nối DB:**
   - **Nguyên nhân:** Chưa chạy Docker container chứa PostgreSQL hoặc khai báo sai cấu hình trong `.env`.
   - **Khắc phục:** Kiểm tra lại các container qua `docker-compose ps` và xem lại biến môi trường `DATABASE_URL` xem đúng thông tin port, username, và password chưa.
