-- AlterTable
ALTER TABLE "ai_task_logs" ADD COLUMN     "is_exported" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "model_used" TEXT,
ADD COLUMN     "user_feedback" TEXT,
ADD COLUMN     "user_rating" INTEGER;

-- CreateTable
CREATE TABLE "ai_templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "tags" TEXT[],
    "content" JSONB NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_templates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ai_templates_category_idx" ON "ai_templates"("category");
