# Luồng Tạo Website Tự Động (Site Creation Flow)

Tài liệu này mô tả chi tiết từng bước (step-by-step) diễn ra đằng sau hệ thống khi một người dùng tạo một trang web mới trên nền tảng Genzite, đặc biệt nhấn mạnh vào **Luồng tạo bằng AI (AI-Driven Generation)**.

---

## 1. Luồng Tạo Website tự động qua Prompt bằng AI

Đây là kịch bản cốt lõi của hệ thống No-code Genzite khi người dùng ra lệnh bằng một câu Prompt: *"Tạo cho tôi một trang web bán cà phê..."*.

### Bước 1: Tiếp nhận yêu cầu (HTTP)
* Người dùng gửi Prompt từ Frontend đến API Gateway. 
* Gateway xác thực và chuyển request vào `GenerationController` của **AI Service**.

### Bước 2: Xếp hàng đợi (Queueing & Asynchronous)
* Việc gọi AI mất nhiều thời gian, hệ thống không bắt người dùng chờ request HTTP đồng bộ. Thay vào đó, API đưa Job này vào hàng đợi **BullMQ (trên Redis)** (Queue: `site-generation`).
* API trả về ngay lập tức mã `HTTP 202 Accepted` kèm theo một mã định danh `jobId`.

### Bước 3: Mở luồng theo dõi tiến độ (SSE Stream)
* Frontend sử dụng `jobId` vừa nhận để mở kết nối **Server-Sent Events (SSE)** tới đường dẫn `/ai/stream/:jobId`.
* Thông qua SSE, Frontend sẽ liên tục nhận phần trăm tiến độ (%) và hiển thị UI Loading theo thời gian thực cho người dùng.

### Bước 4: Kiểm duyệt an toàn (Security Guardrail)
* Trong background, **AI Worker** lấy Job ra khỏi hàng đợi để xử lý.
* Hệ thống gọi `GuardrailService` kiểm tra câu Prompt đầu vào có chứa từ ngữ độc hại, nhạy cảm hay mang tính chất tấn công (Prompt Injection) hay không. 
* Nếu vi phạm, Job bị huỷ ngay lập tức.

### Bước 5: Trích xuất mẫu thông minh (RAG System)
* Gọi `RagService` lấy câu lệnh của người dùng đi tìm kiếm vector trong Database để trích xuất các **"Golden Template"** (những mẫu cấu trúc UX/UI chuẩn mực nhất cho thể loại web đó).
* Mục đích: Nhồi thêm kiến thức (Context) này vào cho AI để AI không thiết kế một cách ngẫu nhiên.

### Bước 6: Kỹ sư AI thiết kế (Coder AI Generation)
* Hệ thống gọi API tới **Google Gemini LLM** (đóng vai trò Coder).
* Coder AI phân tích Prompt + Golden Template để sinh ra toàn bộ bản thiết kế web dưới dạng chuỗi JSON.
* Chuỗi JSON bao gồm: Tên Web, Tên miền (subdomain), danh sách các Trang con (Pages), và mảng các phần tử giao diện (Widgets) được sắp xếp sẵn.

### Bước 7: Chuyên gia UX kiểm duyệt (Auditor AI Reflection)
* Để hạn chế tình trạng AI bị ảo giác (hallucination) tạo ra cấu trúc lỗi, file JSON ở bước 6 được gửi tiếp cho một LLM thứ 2 cực nhanh là **Groq / Llama3** (đóng vai trò Auditor).
* Nếu bản thiết kế có lỗi logic UX/UI, Auditor sẽ trả lại 피드백 (feedback) cảnh báo.
* Coder AI (Gemini) nhận feedback và **tự động sửa lại bản thiết kế**. Vòng lặp phản biện này diễn ra tự động tối đa 2 lần.

### Bước 8: Hoàn tất & Trả kết quả
* Bản thiết kế cuối cùng vượt qua bài kiểm định sẽ được lưu log vào DB (bảng `ai_task_logs`).
* Sự kiện `completed` được kích hoạt trên BullMQ. Luồng SSE đẩy thông báo `100% Done` kèm theo `subdomain` về cho Frontend.
* Frontend tự động chuyển hướng người dùng vào giao diện **App Builder Canvas** với bản thiết kế đã hoàn thành.

---

## 2. Luồng Lưu Trữ Website (Core Site Service)

Sau khi AI sinh ra bản thiết kế JSON (hoặc user tự bấm nút Tạo mới trắng bằng tay), dữ liệu được gửi đến `site-service` để lưu trữ chính thức vào Database.

* **Bước 1: Validate thông tin**
  * Hệ thống kiểm tra tính hợp lệ và độ duy nhất của `subdomain` (Tên miền phụ). Nếu đã có người sử dụng, trả về lỗi `ConflictException`.
* **Bước 2: Ghi vào Database**
  * Dùng **Prisma ORM** để INSERT dữ liệu trang web vào `site_db` (bảng `Site`).
  * Gắn thuộc tính `ownerId` để cấp quyền sở hữu trang web cho người dùng hiện tại.
* **Bước 3: Phát tín hiệu sự kiện (Kafka Event-Driven)**
  * Gọi `SiteProducer` để đẩy một sự kiện có tên `SiteCreated` vào Message Broker **Apache Kafka**.
* **Bước 4: Các Service khác phản ứng (Background Sync)**
  * Nhờ Kafka, các service khác tự động biết một site mới vừa được tạo mà không làm gián đoạn luồng API chính:
    * **AI Service:** Nghe event và có thể tự động chạy ngầm việc sinh ra cấu trúc Database CMS (Collections) phù hợp cho trang web đó.
    * **Notification Service:** Nghe event để bắn thông báo/email chúc mừng user.
