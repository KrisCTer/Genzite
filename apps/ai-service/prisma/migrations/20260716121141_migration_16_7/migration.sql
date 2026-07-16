/*
  Warnings:

  - The values [CV_ANALYSIS,INTERVIEW,CAREER_COACHING] on the enum `AiTaskType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the `interview_sessions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `resumes` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "AiTaskType_new" AS ENUM ('SITE_GENERATION', 'CMS_GENERATION', 'AGENT_TASK');
ALTER TABLE "ai_task_logs" ALTER COLUMN "task_type" TYPE "AiTaskType_new" USING ("task_type"::text::"AiTaskType_new");
ALTER TYPE "AiTaskType" RENAME TO "AiTaskType_old";
ALTER TYPE "AiTaskType_new" RENAME TO "AiTaskType";
DROP TYPE "ai"."AiTaskType_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "interview_sessions" DROP CONSTRAINT "interview_sessions_resume_id_fkey";

-- AlterTable
ALTER TABLE "ai_task_logs" ADD COLUMN     "cost" DOUBLE PRECISION,
ADD COLUMN     "token_usage" INTEGER;

-- DropTable
DROP TABLE "interview_sessions";

-- DropTable
DROP TABLE "resumes";

-- DropEnum
DROP TYPE "SessionStatus";

-- DropEnum
DROP TYPE "SessionType";
