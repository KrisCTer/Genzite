const fs = require('fs');
const path = require('path');

const basePath = String.raw`C:\Users\phucl\Downloads\fcj-workshop-template\content\1-Worklog`;

const polishedDataVi = {
    8: [
        "- Cấu hình hạ tầng: Khởi tạo kiến trúc Monorepo cho dự án Genzite, thiết lập môi trường dev runner và reset hệ thống database migrations.",
        "- Viết đặc tả dự án: Xây dựng tài liệu System Specs chi tiết và nghiên cứu kiến trúc hệ thống Event-driven.",
        "- Microservices Setup: Dựng khung (Scaffold) kiến trúc Microservices cơ bản với 7 services độc lập và các shared packages.",
        "- Tối ưu hệ thống: Nghiên cứu các giải pháp tối ưu code base và thiết lập luồng giao tiếp ban đầu cho Kafka consumers.",
        "- Tài liệu hoá: Cập nhật chi tiết các luồng hoạt động nội bộ và hoàn chỉnh kiến trúc Monorepo.",
        "- Bàn giao tuần 8: Hoàn thành thiết lập nền tảng dự án để chuẩn bị cho giai đoạn phát triển tính năng cốt lõi."
    ],
    9: [
        "- Khởi tạo dự án & Tài liệu: Tích hợp framework AG Kit AI agent, dịch toàn bộ tài liệu (README, kiến trúc) sang Tiếng Anh và chuyển đổi dự án sang pnpm workspace.",
        "- Hạ tầng & Database: Cấu hình Kafka broker và Zookeeper trong docker-compose, tích hợp Prisma ORM cho toàn bộ microservices và thiết lập các biến môi trường.",
        "- Microservices & Kafka: Xây dựng package `@genzite/kafka`, thiết lập hệ thống Kafka Event Bus và cấu hình các NestJS feature modules.",
        "- API Gateway & Bảo mật: Triển khai API gateway proxy, tích hợp auth middleware và xây dựng các validation DTOs cho request.",
        "- Frontend Core: Khởi tạo thư viện shared component, tích hợp vào frontend và cấu hình module Generation/Recruitment.",
        "- Tối ưu mã nguồn: Dọn dẹp code thừa (update-architecture.md), cải tiến script dev.mjs sử dụng text prefix và khắc phục lỗi parse JSON."
    ],
    10: [
        "- Core Services Backend: Hoàn thiện tính năng cho data-service, site-service, triển khai media upload service và notification-service.",
        "- Database & Auth: Cô lập Prisma Client để tránh xung đột giữa 6 services, reset toàn bộ migrations và áp dụng xác thực JWT chuẩn tại API Gateway.",
        "- Hệ thống Kafka & AI: Tích hợp Kafka Producer/Consumer liên service, bổ sung AI agents, MCP, BullMQ workers và hệ thống tracking AiTaskLog.",
        "- Sửa lỗi & Tối ưu: Khắc phục lỗi Gemini Parse Error (422), sửa lỗi Gateway Proxy khi upload file và giải quyết các cảnh báo TypeScript ẩn.",
        "- Đảm bảo chất lượng (QA): Hoàn thành 100% Unit Test coverage cho toàn bộ 6 microservices và API gateway.",
        "- Đóng gói Backend: Ổn định toàn bộ kiến trúc Backend, giải quyết các conflicts và đạt trạng thái Production-ready hoàn chỉnh."
    ],
    11: [
        "- Kiến trúc AI Core: Triển khai kiến trúc Hybrid Parallel UI Generation (kết hợp Stitch SDK, Groq, Llama 3.3) chạy song song với các tiến trình LLMs.",
        "- Mở rộng AI Tooling: Cấu hình ToolRegistry, tích hợp giao thức MCP cho các AI Clients (Gemini, DeepSeek, Groq) và tự động đồng bộ màu sắc trang (2-stage execution).",
        "- Frontend Canvas & UI: Hỗ trợ Preview HTML/Images trực tiếp trên giao diện, thêm mới các widget chuyên dụng (Pricing, FAQ, Contact) và trích xuất style từ Stitch HTML.",
        "- Quản lý hệ thống: Khởi tạo Frontend với Routing, Theme Provider, Admin Dashboard và kết nối API thực tế cho phân hệ User Management.",
        "- State Management: Tích hợp trạng thái giỏ hàng toàn cục (Zustand cart store) và thiết kế lại giao diện Home, AI Canvas, Agent Logs.",
        "- Tối ưu hoá & Cleanup: Dọn dẹp các hàm tiện ích thừa (utility functions), cấu hình lệnh chạy đồng thời (concurrently) và cập nhật sơ đồ kiến trúc AI."
    ],
    12: [
        "- Canvas Workspace & UI: Tái cấu trúc toàn diện Canvas (style panel, code viewer), thêm EditViewer với GrapesJS, tính năng Undo/Redo (CanvasPageFrame) và hiệu ứng Glowing UI.",
        "- Frontend Auth & Phân quyền: Củng cố bảo mật Frontend (Auth hardening), quản lý Dashboard với các quyền truy cập RBAC, chặn user khách chỉnh sửa widget và tự động đóng bảng điều khiển.",
        "- Hệ thống Backend & API: Tự động unwrap các phản hồi API lồng nhau ({data: []}, {items: []}), tắt AWS CRC32 checksum để sửa lỗi upload presigned url và đảm bảo 100% Type Safety (noImplicitAny).",
        "- Triển khai CI/CD: Thiết lập GitHub Actions tự động deploy Backend lên AWS ECS và Frontend lên Vercel, xoá bỏ các volume mounts cục bộ trên Production.",
        "- Server & Proxy: Cấu hình Nginx reverse proxy với tính năng DNS cache nội bộ, security headers, gzip và xử lý API routing.",
        "- Hoàn thiện & Ổn định: Khoá phiên bản Prisma CLI (v6) để chống vỡ schema, xoá bỏ mã nguồn thừa của Commerce Service, dọn dẹp file rác và ổn định toàn bộ dự án."
    ]
};

const polishedDataEn = {
    8: [
        "- Infrastructure Setup: Init Genzite monorepo architecture, setup dev runner, and reset database migrations system.",
        "- System Specifications: Build detailed System Specs documentation and research Event-driven architecture.",
        "- Microservices Scaffold: Scaffold foundational Microservices architecture with 7 independent services and shared packages.",
        "- System Optimization: Research project base code optimization and setup initial communication flows for Kafka consumers.",
        "- Documentation: Update detailed internal flows and finalize monorepo architecture.",
        "- Week 8 Handover: Complete foundational project setup for the upcoming core feature development phase."
    ],
    9: [
        "- Project Initialization & Docs: Integrate AG Kit AI agent framework, translate all project documentation (README, architecture) to English, and migrate to pnpm workspace.",
        "- Infrastructure & DB: Configure Kafka broker and Zookeeper in docker-compose, integrate Prisma ORM across all microservices, and setup env vars.",
        "- Microservices & Kafka: Build `@genzite/kafka` package, setup Kafka Event Bus, and configure NestJS feature modules.",
        "- API Gateway & Security: Implement API gateway proxy, integrate auth middleware, and build validation DTOs.",
        "- Frontend Core: Initialize shared component library, integrate with frontend, and configure Generation/Recruitment modules.",
        "- Code Optimization: Clean up redundant files, improve dev.mjs script with text prefixes, and fix JSON parsing issues."
    ],
    10: [
        "- Core Services Backend: Complete feature sets for data-service, site-service, media upload, and notification-service.",
        "- Database & Auth: Isolate Prisma Client to prevent conflicts across 6 services, reset migrations, and apply real JWT validation at API Gateway.",
        "- Kafka & AI System: Integrate cross-service Kafka Producer/Consumer, add AI agents, MCP, BullMQ workers, and AiTaskLog tracking.",
        "- Bug Fixes & Optimization: Fix Gemini Parse Error (422), resolve Gateway Proxy file upload bug, and address hidden TypeScript warnings.",
        "- Quality Assurance (QA): Achieve 100% Unit Test coverage for all 6 microservices and API gateway.",
        "- Backend Packaging: Stabilize the entire Backend architecture, resolve merge conflicts, and achieve a fully Production-ready status."
    ],
    11: [
        "- AI Core Architecture: Implement Hybrid Parallel UI Generation architecture (Stitch SDK, Groq, Llama 3.3) running alongside LLM processes.",
        "- Extended AI Tooling: Configure ToolRegistry, integrate MCP protocol for AI Clients, and automate page color synchronization (2-stage execution).",
        "- Frontend Canvas & UI: Support direct HTML/Images Preview on the canvas, add new widgets (Pricing, FAQ, Contact), and extract styles from Stitch HTML.",
        "- System Management: Initialize Frontend with Routing, Theme Provider, Admin Dashboard, and connect real APIs for User Management.",
        "- State Management: Integrate global shopping cart state (Zustand cart store) and redesign Home, AI Canvas, Agent Logs UI.",
        "- Optimization & Cleanup: Clean up redundant utility functions, configure concurrent startup scripts, and update AI architecture diagrams."
    ],
    12: [
        "- Canvas Workspace & UI: Completely refactor Canvas (style panel, code viewer), add EditViewer with GrapesJS, CanvasPageFrame (Undo/Redo), and Glowing UI effects.",
        "- Frontend Auth & RBAC: Harden Frontend Auth, manage Dashboard with RBAC permissions, block guest users from editing widgets, and auto-close side panels.",
        "- Backend Systems & API: Auto-unwrap nested API responses ({data: []}), disable AWS CRC32 checksum to fix presigned url uploads, and ensure 100% Type Safety (noImplicitAny).",
        "- CI/CD Deployment: Setup GitHub Actions for automated Vercel (Frontend) and AWS ECS (Backend) deployments, and remove local volume mounts in Production.",
        "- Server & Proxy: Configure Nginx reverse proxy with internal DNS cache, security headers, gzip, and API routing handling.",
        "- Finalization & Stability: Pin Prisma CLI version (v6) to prevent schema breakage, remove deprecated Commerce Service code, clean up dead files, and stabilize the entire project."
    ]
};

const weekFolders = {
    8: '1.8-Week8', 9: '1.9-Week9', 10: '1.10-Week10', 11: '1.11-Week11', 12: '1.12-Week12'
};

const weekStartDates = {
    8: new Date(2026, 5, 8),
    9: new Date(2026, 5, 15),
    10: new Date(2026, 5, 22),
    11: new Date(2026, 5, 29),
    12: new Date(2026, 6, 6)
};

const dayNumbers = ['2', '3', '4', '5', '6', '7'];

function formatDate(date) {
    const d = String(date.getDate()).padStart(2, '0');
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const y = date.getFullYear();
    return `${d}/${m}/${y}`;
}

for (const w of [8,9,10,11,12]) {
    const startDate = weekStartDates[w];
    const tasksVi = polishedDataVi[w];
    const tasksEn = polishedDataEn[w];
    
    let tableRowsVi = [];
    let tableRowsEn = [];
    
    for (let i = 0; i < 6; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i);
        const dateStr = formatDate(currentDate);
        
        const taskLineVi = tasksVi[i];
        const taskLineEn = tasksEn[i];
        
        let noteVi = `- Phát triển và hoàn thiện hệ thống`;
        let noteEn = `- Develop and stabilize system architecture`;
        
        if (i === 5) {
            noteVi += ` <br> - Write Week ${w} Worklog`;
            noteEn += ` <br> - Write Week ${w} Worklog`;
        }
        
        const cellVi = `**THỰC HÀNH CAPSTONE (GENZITE):** <br> ${taskLineVi} <br> **GHI CHÚ:** <br> ${noteVi}`;
        const cellEn = `**CAPSTONE PROJECT (GENZITE):** <br> ${taskLineEn} <br> **NOTES:** <br> ${noteEn}`;
        
        tableRowsVi.push(`| ${dayNumbers[i]} | ${cellVi} | ${dateStr} | ${dateStr} | [github.com/KrisCTer/Genzite](https://github.com/KrisCTer/Genzite) |`);
        tableRowsEn.push(`| ${dayNumbers[i]} | ${cellEn} | ${dateStr} | ${dateStr} | [github.com/KrisCTer/Genzite](https://github.com/KrisCTer/Genzite) |`);
    }

    const mdContentVi = `---
title: "Worklog Tuần ${w}"
weight: ${w}
chapter: false
pre: " <b> 1.${w}. </b> "
---

### Mục tiêu tuần ${w}:
* Thực hiện các task backend và frontend theo tiến độ dự án Genzite (Xem chi tiết ở bảng dưới).

### Các công việc cần triển khai trong tuần này:
| Thứ | Công việc | Ngày bắt đầu | Ngày hoàn thành | Nguồn tài liệu |
| --- | --- | --- | --- | --- |
${tableRowsVi.join('\n')}

### Kết quả đạt được tuần ${w}:
* Hoàn thành các tính năng theo đúng lịch trình commit trên Git, đảm bảo tiến độ triển khai Capstone Project.
`;

    const mdContentEn = `---
title: "Week ${w} Worklog"
weight: ${w}
chapter: false
pre: " <b> 1.${w}. </b> "
---

### Objectives for Week ${w}:
* Implement backend and frontend tasks according to the Genzite project schedule (See table below).

### Tasks to be implemented this week:
| Day | Task | Start Date | End Date | References |
| --- | --- | --- | --- | --- |
${tableRowsEn.join('\n')}

### Achievements for Week ${w}:
* Completed features according to the Git commit schedule, ensuring the Capstone Project timeline.
`;

    const viPath = path.join(basePath, weekFolders[w], '_index.vi.md');
    const enPath = path.join(basePath, weekFolders[w], '_index.md');

    fs.writeFileSync(viPath, mdContentVi, 'utf-8');
    fs.writeFileSync(enPath, mdContentEn, 'utf-8');
}

console.log("Xong! Đã tạo file với nội dung nhóm KHÔNG CẮT BỎ CHI TIẾT.");
