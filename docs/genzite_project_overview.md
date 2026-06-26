# Genzite Project Overview

Genzite is a No-Code Enterprise App Builder & Dynamic CMS platform completely driven by Artificial Intelligence (AI). Non-technical users can create web applications, build content structures, or perform recruitment analysis using only natural language prompts.

## Tech Stack

* Frontend: Developed with React 18+, Vite, TypeScript, and Tailwind CSS v4. Features two main interfaces: App Builder Canvas (drag & drop) and App CMS Dashboard (management), focusing on a warm, friendly UI experience (avoiding harsh traditional IT dashboard designs).
* Backend (Microservices / Modular Monolith): Built with NestJS and Prisma ORM. The system is split into 7 core services communicating asynchronously via Kafka and synchronously via API Gateway:
  1. gateway: Handles API routing and Rate Limiting.
  2. identity-service: User authentication, JWT, and authorization (RBAC).
  3. site-service: Website management, drag & drop interface (widgets, pages).
  4. data-service: Dynamic CMS management using PostgreSQL JSONB capabilities (no hardcoded columns).
  5. media-service: Generates direct upload URLs (Presigned URLs).
  6. notification-service: Handles sending notifications (Email, In-App).
  7. ai-service: Handles complex AI tasks with Google Gemini via Model Context Protocol (MCP), Multi-Agent architecture, and BullMQ queues.

## AWS Services Utilized & Deployment Reasoning

The system is architected as Cloud-Native on AWS to optimize for scalability, security, and cost-efficiency.

1. Amazon Route 53, CloudFront & WAF (Edge Layer)
* Amazon Route 53: Handles DNS resolution and flexible routing for custom domains.
* Amazon CloudFront: Global CDN for static Frontend files, automatically handles SSL/TLS certificates and reduces load via Edge Caching.
* AWS WAF: Web Application Firewall attached to CloudFront to protect against common web exploits.
* AWS Certificate Manager (CM): Provisions and manages SSL/TLS certificates for CloudFront and ALB.

2. Amazon S3 (Object Storage Layer)
* S3 Frontend Bucket: Stores static React source code, accessed only via CloudFront.
* S3 Media Bucket: Stores multimedia files. Uses Presigned URLs for browsers to bypass Backend and upload directly to S3, optimizing bandwidth/CPU.

3. Network & Load Balancing Layer
* Internet Gateway (IGW): Connects the system's VPC to the public Internet.
* Application Load Balancer (ALB): Receives HTTPS (443) traffic, distributes via Round Robin to EC2 instances with Health Checks.
* NAT Gateway: Allows EC2 instances in Private Subnets to securely connect outwards (e.g., calling Google Gemini APIs) without exposing public IPs.

4. Compute & Identity Layer
* Amazon EC2 Auto Scaling Group & EBS: Runs NestJS clusters in Private Subnets. Attached with Elastic Block Store (EBS). Auto-scales based on internal CPU load.
* Amazon Cognito: Identity and user management system providing professional and secure authentication solutions.

5. Data & Management Layer
* Amazon RDS PostgreSQL: Primary database (Multi-AZ), combining relational queries and NoSQL (JSONB) for CMS content.
* Amazon ElastiCache (Redis): Caching for Sessions, AI Response Cache, and message queue coordination for BullMQ.
* AWS Backup: Automated centralized backup and data protection.
* Amazon CloudWatch: Monitoring platform, collecting real-time logs and alerts for AWS infrastructure.

## System Data Flow

Based on the architectural diagram, the system operates through 17 main Data Flow steps:
1. **Sign-in / Sign-up & Get JWT Token**: Users communicate with Amazon Cognito to authenticate and receive a token (JWT).
2. **Send HTTP/HTTPS Requests**: User's browser sends requests over the public internet to the system's Internet Gateway (IGW).
3. **Dynamic Domain Routing**: Requests pass through Amazon Route 53 for dynamic domain resolution.
4. **Resolve to CDN distribution**: Route 53 directs static traffic to Amazon CloudFront CDN.
5. **Traffic Filtering & Protection**: AWS WAF filters and blocks malicious access at the CloudFront layer.
6. **Cache Miss / Fetch Static Assets**: When CloudFront lacks cache, it fetches static React files directly from the Frontend S3 Bucket.
7. **DNS CNAME Validation**: System automatically validates domains via Route 53 for SSL certificates.
8. **SSL/TLS Cert (CloudFront)**: CloudFront receives SSL/TLS certs from AWS Certificate Manager (CM).
9. **Forward Public Request**: Dynamic API traffic goes through the Internet Gateway (IGW) to the Application Load Balancer (ALB).
10. **SSL/TLS Cert (ALB)**: Similar to CloudFront, ALB uses SSL certs from AWS CM to decrypt HTTPS requests.
11. **Route Request to Backend**: ALB securely routes API requests into EC2 instances (running NestJS) located in Private Subnets.
12. **Outbound Internet Traffic**: EC2 instances send requests out to the internet (e.g., Google Gemini) unidirectionally via NAT Gateway and IGW.
13. **JWKS Verification**: Backend on EC2 verifies user JWT token validity via Amazon Cognito.
14. **Database & Block Storage**: EC2 reads/writes structured (SQL) and unstructured (JSONB) data with RDS, interacts with ElastiCache (Redis) for caching, and accesses local storage on EBS.
15. **Automated Daily Backup**: Data from services (EBS, RDS) is automatically backed up periodically via AWS Backup.
16. **Log Streaming & Monitoring**: Logs and metrics from all EC2 instances are continuously streamed to Amazon CloudWatch.
17. **Generate S3 Presigned URL**: EC2 authenticates and generates a temporary upload link (Presigned URL) returned to users for direct media uploads to S3.

This multi-layer architecture paired with an optimized operational flow allows Genzite to excellently fulfill security from the outside-in, maintain low costs initially (MVP), and fully support Enterprise Scale loads when expanding.
