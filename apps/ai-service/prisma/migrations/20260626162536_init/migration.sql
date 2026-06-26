-- CreateEnum
CREATE TYPE "SessionType" AS ENUM ('TECHNICAL', 'BEHAVIORAL', 'MIXED');

-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED');

-- CreateEnum
CREATE TYPE "AiTaskType" AS ENUM ('SITE_GENERATION', 'CMS_GENERATION', 'CV_ANALYSIS', 'INTERVIEW', 'AGENT_TASK', 'CAREER_COACHING');

-- CreateEnum
CREATE TYPE "AiTaskStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "resumes" (
    "id" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,
    "title" TEXT,
    "raw_text" TEXT,
    "s3_key" TEXT,
    "parsed_profile" JSONB,
    "ats_scores" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "resumes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interview_sessions" (
    "id" TEXT NOT NULL,
    "job_description" TEXT NOT NULL,
    "session_type" "SessionType" NOT NULL,
    "dialogue_history" JSONB NOT NULL DEFAULT '[]',
    "evaluation" JSONB,
    "status" "SessionStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "resume_id" TEXT NOT NULL,

    CONSTRAINT "interview_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_task_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "task_type" "AiTaskType" NOT NULL,
    "status" "AiTaskStatus" NOT NULL DEFAULT 'PENDING',
    "input" JSONB NOT NULL DEFAULT '{}',
    "output" JSONB,
    "error" TEXT,
    "started_at" TIMESTAMP(3),
    "ended_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_task_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "resumes_owner_id_idx" ON "resumes"("owner_id");

-- CreateIndex
CREATE INDEX "interview_sessions_resume_id_idx" ON "interview_sessions"("resume_id");

-- CreateIndex
CREATE INDEX "interview_sessions_status_idx" ON "interview_sessions"("status");

-- CreateIndex
CREATE INDEX "ai_task_logs_user_id_idx" ON "ai_task_logs"("user_id");

-- CreateIndex
CREATE INDEX "ai_task_logs_task_type_status_idx" ON "ai_task_logs"("task_type", "status");

-- AddForeignKey
ALTER TABLE "interview_sessions" ADD CONSTRAINT "interview_sessions_resume_id_fkey" FOREIGN KEY ("resume_id") REFERENCES "resumes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
