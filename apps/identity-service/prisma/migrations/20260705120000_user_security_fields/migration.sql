-- Align identity.users with current Prisma schema
ALTER TABLE "identity"."users" ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'ACTIVE';
ALTER TABLE "identity"."users" ADD COLUMN IF NOT EXISTS "metadata" JSONB;
ALTER TABLE "identity"."users" ADD COLUMN IF NOT EXISTS "failed_login_attempts" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "identity"."users" ADD COLUMN IF NOT EXISTS "locked_until" TIMESTAMP(3);
ALTER TABLE "identity"."users" ADD COLUMN IF NOT EXISTS "last_login_at" TIMESTAMP(3);

UPDATE "identity"."users"
SET "status" = CASE WHEN "is_active" = true THEN 'ACTIVE' ELSE 'INACTIVE' END
WHERE "status" = 'ACTIVE' AND "is_active" IS NOT NULL;

ALTER TABLE "identity"."users" DROP COLUMN IF EXISTS "is_active";
ALTER TABLE "identity"."users" ALTER COLUMN "name" DROP NOT NULL;

-- CreateTable
CREATE TABLE IF NOT EXISTS "identity"."audit_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "action" TEXT NOT NULL,
    "ip_address" TEXT,
    "details" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "audit_logs_user_id_idx" ON "identity"."audit_logs"("user_id");
CREATE INDEX IF NOT EXISTS "audit_logs_action_idx" ON "identity"."audit_logs"("action");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'audit_logs_user_id_fkey'
  ) THEN
    ALTER TABLE "identity"."audit_logs"
      ADD CONSTRAINT "audit_logs_user_id_fkey"
      FOREIGN KEY ("user_id") REFERENCES "identity"."users"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
