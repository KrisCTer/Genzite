# Tổng Quan Dự Án Genzite

Genzite là một nền tảng Xây dựng Ứng dụng Doanh nghiệp Không Cần Code (No-Code App Builder) & Hệ quản trị nội dung động (Dynamic CMS) được thúc đẩy hoàn toàn bởi Trí tuệ nhân tạo (AI). Người dùng không chuyên về kỹ thuật có thể tạo ra các ứng dụng web, xây dựng nội dung hoặc phân tích tuyển dụng chỉ thông qua các câu lệnh tự nhiên.

## Kiến Trúc Kỹ Thuật (Tech Stack)

* Frontend: Phát triển bằng React 18+, Vite, TypeScript và Tailwind CSS v4. Bao gồm hai giao diện chính là App Builder Canvas (kéo thả) và App CMS Dashboard (quản trị), chú trọng vào trải nghiệm UI ấm cúng, thân thiện (không dùng thiết kế quá gai góc kiểu bảng điều khiển IT truyền thống).
* Backend (Microservices / Modular Monolith): Sử dụng NestJS kết hợp Prisma ORM. Hệ thống chia thành 7 service lõi giao tiếp bất đồng bộ qua Kafka và đồng bộ qua API Gateway:
  1. gateway: Xử lý định tuyến API và Rate Limiting.
  2. identity-service: Xác thực người dùng, JWT, và phân quyền (RBAC).
  3. site-service: Quản lý website, giao diện kéo thả (widgets, pages).
  4. data-service: Quản lý CMS động sử dụng tính năng JSONB của PostgreSQL (không dùng column cứng).
  5. media-service: Tạo URL tải lên file trực tiếp (Presigned URL).
  6. notification-service: Xử lý việc gửi thông báo (Email, Push).
  7. ai-service: Xử lý các tác vụ AI phức tạp với Google Gemini thông qua Model Context Protocol (MCP), kiến trúc Multi-Agent và hàng đợi BullMQ.

## Các Dịch Vụ AWS Sử Dụng & Lý Do Triển Khai

Hệ thống được kiến trúc theo mô hình Cloud-Native trên AWS để tối ưu khả năng mở rộng, bảo mật và hiệu suất chi phí.

1. Amazon Route 53, CloudFront & WAF (Lớp Edge)
* Amazon Route 53: Xử lý phân giải DNS, định tuyến linh hoạt cho các tên miền riêng.
* Amazon CloudFront: CDN phân phối file tĩnh Frontend toàn cầu, tự động xử lý chứng chỉ SSL/TLS và giảm tải thông qua Edge Caching.
* AWS WAF: Tường lửa ứng dụng web gắn vào CloudFront để bảo vệ ứng dụng khỏi các khai thác bảo mật web phổ biến.
* AWS Certificate Manager (CM): Cấp phát và quản lý chứng chỉ SSL/TLS cho CloudFront và ALB.

2. Amazon S3 (Lớp Object Storage)
* S3 Frontend Bucket: Lưu trữ mã nguồn tĩnh của React, chỉ truy xuất qua CloudFront.
* S3 Media Bucket: Lưu trữ tập tin đa phương tiện. Sử dụng Presigned URL để trình duyệt bypass Backend tải thẳng lên S3, tối ưu băng thông/CPU.

3. Lớp Mạng & Cân Bằng Tải (Network & Load Balancing)
* Internet Gateway (IGW): Cửa ngõ kết nối VPC của hệ thống với mạng Internet công cộng.
* Application Load Balancer (ALB): Cổng nhận lưu lượng HTTPS (443), phân phối cân bằng tải (Round Robin) đến các EC2 kèm Health Checks.
* NAT Gateway: Giúp máy chủ EC2 trong Private Subnet kết nối an toàn ra ngoài (gọi API Google Gemini) mà không lộ public IP.

4. Lớp Tính Toán & Xác Thực (Compute & Identity)
* Amazon EC2 Auto Scaling Group & EBS: Chạy các cụm NestJS trong Private Subnet. Có gắn phân vùng ổ cứng EBS (Elastic Block Store). Tự động scale dựa trên tải CPU nội bộ.
* Amazon Cognito: Hệ thống định danh và quản lý người dùng, cung cấp giải pháp xác thực (Authentication) bảo mật và chuyên nghiệp.

5. Lớp Dữ Liệu & Quản Trị (Data & Management)
* Amazon RDS PostgreSQL: Cơ sở dữ liệu chính (Multi-AZ), kết hợp truy vấn quan hệ và NoSQL (JSONB) cho nội dung CMS.
* Amazon ElastiCache (Redis): Bộ nhớ đệm cho Session, AI Response Cache và điều phối hàng đợi (Message Queue) cho BullMQ.
* AWS Backup: Tự động sao lưu và bảo vệ tập trung dữ liệu của toàn hệ thống.
* Amazon CloudWatch: Nền tảng giám sát (Monitoring), thu thập log và cảnh báo thời gian thực cho hạ tầng AWS.

## Luồng Hệ Thống Dữ Liệu (System Data Flow)

Dựa trên sơ đồ kiến trúc, hệ thống vận hành theo 17 bước luồng dữ liệu (Data Flow) chính:
1. **Sign-in / Sign-up & Get JWT Token**: Người dùng giao tiếp với Amazon Cognito để đăng nhập/đăng ký và nhận token (JWT).
2. **Send HTTP/HTTPS Requests**: Trình duyệt của người dùng gửi request thông qua mạng Internet công cộng vào Internet Gateway (IGW) của hệ thống.
3. **Dynamic Domain Routing**: Request đi qua Amazon Route 53 để phân giải tên miền động.
4. **Resolve to CDN distribution**: Route 53 điều hướng lưu lượng truy cập tĩnh đến nền tảng CDN của Amazon CloudFront.
5. **Traffic Filtering & Protection**: Dịch vụ tường lửa AWS WAF lọc và chặn các truy cập độc hại ngay tại lớp CloudFront.
6. **Cache Miss / Fetch Static Assets**: Khi CloudFront chưa có cache, nó sẽ lấy trực tiếp các file tĩnh của ứng dụng React từ Frontend S3 Bucket.
7. **DNS CNAME Validation**: Hệ thống tự động xác thực tên miền qua Route 53 cho các chứng chỉ SSL.
8. **SSL/TLS Cert (CloudFront)**: CloudFront nhận chứng chỉ bảo mật SSL/TLS từ dịch vụ AWS Certificate Manager (CM).
9. **Forward Public Request**: Lưu lượng API động đi qua Internet Gateway (IGW) đến Application Load Balancer (ALB).
10. **SSL/TLS Cert (ALB)**: Tương tự CloudFront, ALB cũng dùng chứng chỉ SSL từ AWS CM để giải mã HTTPS request.
11. **Route Request to Backend**: ALB định tuyến an toàn các API request vào cụm máy chủ ảo EC2 (chứa NestJS App) nằm trong Private Subnet.
12. **Outbound Internet Traffic**: Các máy chủ EC2 gửi request ra ngoài Internet (ví dụ gọi AI Google Gemini) một chiều thông qua NAT Gateway và IGW.
13. **JWKS Verification**: Backend trên EC2 xác minh tính hợp lệ của token JWT người dùng gửi lên thông qua Amazon Cognito.
14. **Database & Block Storage**: EC2 đọc/ghi dữ liệu có cấu trúc (SQL) và phi cấu trúc (JSONB) với RDS, tương tác với ElastiCache (Redis) cho bộ nhớ đệm, và truy xuất bộ nhớ cục bộ trên ổ cứng EBS.
15. **Automated Daily Backup**: Dữ liệu từ các dịch vụ (EBS, RDS) được tự động sao lưu định kỳ qua hệ thống AWS Backup.
16. **Log Streaming & Monitoring**: Logs và metric hoạt động của toàn bộ các máy chủ EC2 được truyền liên tục về nền tảng Amazon CloudWatch.
17. **Generate S3 Presigned URL**: EC2 xác thực và sinh ra một đường dẫn tải lên tạm thời (Presigned URL) trả về cho người dùng để họ upload file trực tiếp lên Media S3 Bucket.

Mô hình kiến trúc đa lớp kết hợp với luồng vận hành tối ưu này giúp Genzite đáp ứng xuất sắc tính bảo mật từ ngoài vào trong, duy trì chi phí thấp ở giai đoạn đầu (MVP) và hoàn toàn đủ khả năng chịu tải quy mô khổng lồ (Enterprise Scale) khi mở rộng.
