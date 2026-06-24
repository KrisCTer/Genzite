-- CreateTable
CREATE TABLE "cms_collections" (
    "id" TEXT NOT NULL,
    "site_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "schema_definition" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cms_collections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cms_records" (
    "id" TEXT NOT NULL,
    "data" JSONB NOT NULL DEFAULT '{}',
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "collection_id" TEXT NOT NULL,

    CONSTRAINT "cms_records_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "cms_collections_site_id_idx" ON "cms_collections"("site_id");

-- CreateIndex
CREATE UNIQUE INDEX "cms_collections_site_id_slug_key" ON "cms_collections"("site_id", "slug");

-- CreateIndex
CREATE INDEX "cms_records_collection_id_idx" ON "cms_records"("collection_id");

-- CreateIndex
CREATE INDEX "cms_records_created_by_idx" ON "cms_records"("created_by");

-- AddForeignKey
ALTER TABLE "cms_records" ADD CONSTRAINT "cms_records_collection_id_fkey" FOREIGN KEY ("collection_id") REFERENCES "cms_collections"("id") ON DELETE CASCADE ON UPDATE CASCADE;
