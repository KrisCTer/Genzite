# 🚀 Genzite - Toàn Cảnh Dự Án (Full Project Overview)

## 1. Mục Tiêu & Chức Năng Cốt Lõi
Genzite là một nền tảng **Enterprise App Builder & Dynamic CMS** được hỗ trợ hoàn toàn bởi AI. Nó cho phép người dùng (kể cả những người không có kiến thức lập trình) tạo ra các ứng dụng web phức tạp chỉ bằng ngôn ngữ tự nhiên.

**Các chức năng đã được phát triển trong mã nguồn (Source Control):**
- **App Builder Canvas (`/builder`):** Giao diện kéo thả các widget, cấu hình trang, thiết kế giao diện động.
- **Dynamic CMS Dashboard (`/cms`):** Quản lý cấu trúc dữ liệu không giới hạn (Collections/Records) thông qua nền tảng JSONB.
- **Xác thực người dùng (`/login`):** Đăng ký, đăng nhập bảo mật bằng JWT và phân quyền RBAC.
- **Tích hợp Trí tuệ nhân tạo (AI):** Multi-agent orchestration (điều phối đa tác vụ), phân tích CV tuyển dụng, sinh mã UI tự động.

---

## 2. Kiến Trúc Microservices (Backend)
Dự án được xây dựng dưới dạng **Monorepo** với công cụ `pnpm workspaces`. Các hệ thống máy chủ (Microservices) nằm trong thư mục `apps/` được viết bằng **NestJS**, giao tiếp với nhau qua **API Gateway (HTTP)** và **Kafka (Event-Driven)**.

| Tên Service | Port | Trách nhiệm chính |
|---|---|---|
| **Gateway** | 3000 | Router phân luồng, Rate-limiting, Bypass Auth cục bộ môi trường dev |
| **Identity Service** | 3001 | Đăng nhập, phân quyền, cấp phát và xác minh JWT token |
| **Site Service** | 3002 | Lưu trữ thông tin Website, các Trang (Pages) và các thành phần (Widgets) |
| **Data Service** | 3003 | Vận hành Dynamic CMS. Cấu trúc linh hoạt lưu trữ dưới dạng JSONB |
| **Media Service** | 3004 | Xử lý upload trực tiếp thông qua cơ chế AWS S3 Presigned URL |
| **Notification Service** | 3005 | Đón lõng event Kafka, gửi Email / Push / In-App notification |
| **AI Service** | 3006 | Chứa AI Agents, Pipeline Engine, MCP Server/Client tích hợp LLM Gemini |
| **Commerce Service** | - | Quản lý Đơn hàng (Orders) và Thanh toán (Payments) |

---

## 3. Hệ Sinh Thái AI & Model Context Protocol (MCP)
**AI Service** là bộ脑 trung tâm của Genzite, được thiết kế với kiến trúc vô cùng tinh xảo:

- **Pipeline Engine (`pipeline.runner.ts`):** 
  Kiến trúc chạy kịch bản (workflow) theo từng bước tuần tự. Tự động chuyển giao dữ liệu (Đầu ra bước này là đầu vào bước sau), hỗ trợ bỏ qua bước (conditional step) và tự động ghi log lỗi chi tiết.

- **Multi-Agent Orchestrator (`agent.service.ts`):** 
  Sử dụng Google Gemini LLM. Agent tự động gọi Tool (Function Calling) thông qua một vòng lặp kín (Loop lên tới tối đa 5 vòng) để suy luận nội bộ và lấy thêm thông tin tự động, không cần đợi phản hồi từng bước từ người dùng.

- **Tích hợp chuẩn giao tiếp MCP 2 chiều:**
  - **MCP Client (`mcp-client.service.ts`):** Hệ thống chủ động kết nối ra các máy chủ ngoại vi, "bê nguyên" các công cụ của bên ngoài về đăng ký thành Tools cho Gemini ở trong dùng.
  - **MCP Server (`mcp-server.service.ts`):** Tự động mở một cổng giao tiếp dạng Stateless (Serverless) để public các Tools nội bộ của Genzite. Qua đó các AI System bên ngoài có thể gọi lại vào Genzite.

---

## 4. Kiến Trúc Luồng Hoạt Động (Workflows)

### 4.1. Luồng Đồng Bộ (Synchronous API Flow)
Được sử dụng cho các thao tác trên giao diện trực quan cần phản hồi tức thì. 
- **Quy trình:** `Trình duyệt Frontend` ➔ `API Gateway` ➔ `Các Core Services (Site, Data, Identity)`.
- **Ví dụ:** Thêm một bản ghi Record mới trong CMS, kéo một Widget vào trang.

### 4.2. Luồng Bất Đồng Bộ (Event-driven Flow với Kafka)
Sử dụng cho logic chạy ngầm, liên thông nhiều hệ thống mà không làm chậm trải nghiệm của User. 
- **Quy trình:** `Service A` (Tạo tài khoản thành công) ➔ Đẩy tin nhắn `user.registered` vào Kafka ➔ `Notification Service` nhận tin nhắn ➔ Gửi email chào mừng.

### 4.3. Luồng Upload Trực Tiếp (Direct S3 Upload Flow)
- Thay vì đẩy ảnh dung lượng lớn từ Frontend qua Backend gây quá tải máy chủ.
- **Quy trình:** Frontend gọi `Media Service` để xin giấy phép tạm thời (Presigned URL) ➔ Frontend tự đẩy file đó thẳng lên AWS S3 ➔ Thành công thì báo lại Backend để ghi đè log/Metadata.

---

## 5. Công Nghệ / Hạ Tầng Cốt Lõi
Hệ thống sử dụng các công nghệ tiêu chuẩn quốc tế cho triển khai Cloud-Native (Microservices thuần tuý trên nền AWS):

- **Frontend:** React 18, Vite, TypeScript, Tailwind CSS v4.
- **Backend:** NestJS, NodeJS, Prisma ORM.
- **Database:** PostgreSQL (Kết hợp Relations SQL truyền thống và JSONB cho dữ liệu No-Code).
- **Cache & Queue:** Redis, BullMQ (Quản lý hàng đợi cho các Job xử lý AI nặng).
- **Message Broker:** Apache Kafka (kèm Zookeeper).
- **Trí Tuệ Nhân Tạo:** Google Gemini API, Model Context Protocol (MCP SDK).
- **Kiến trúc triển khai (Infra):** Quản trị Monorepo qua Pnpm. Chạy Local bằng Docker Compose. Thiết kế Production trên hệ sinh thái AWS (EC2, S3, RDS, ElastiCache, ALB, CloudFront).
