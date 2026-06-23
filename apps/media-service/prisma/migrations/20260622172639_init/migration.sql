-- CreateTable
CREATE TABLE "media_files" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "s3_key" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "size_bytes" INTEGER NOT NULL,
    "owner_id" TEXT NOT NULL,
    "alt" TEXT,
    "width" INTEGER,
    "height" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "folder_id" TEXT,

    CONSTRAINT "media_files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media_folders" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,
    "parent_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "media_folders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media_tags" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "media_tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_MediaFileToMediaTag" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_MediaFileToMediaTag_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "media_files_s3_key_key" ON "media_files"("s3_key");

-- CreateIndex
CREATE INDEX "media_files_owner_id_idx" ON "media_files"("owner_id");

-- CreateIndex
CREATE INDEX "media_files_mime_type_idx" ON "media_files"("mime_type");

-- CreateIndex
CREATE INDEX "media_files_folder_id_idx" ON "media_files"("folder_id");

-- CreateIndex
CREATE UNIQUE INDEX "media_folders_owner_id_name_parent_id_key" ON "media_folders"("owner_id", "name", "parent_id");

-- CreateIndex
CREATE UNIQUE INDEX "media_tags_name_key" ON "media_tags"("name");

-- CreateIndex
CREATE INDEX "_MediaFileToMediaTag_B_index" ON "_MediaFileToMediaTag"("B");

-- AddForeignKey
ALTER TABLE "media_files" ADD CONSTRAINT "media_files_folder_id_fkey" FOREIGN KEY ("folder_id") REFERENCES "media_folders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_folders" ADD CONSTRAINT "media_folders_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "media_folders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MediaFileToMediaTag" ADD CONSTRAINT "_MediaFileToMediaTag_A_fkey" FOREIGN KEY ("A") REFERENCES "media_files"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MediaFileToMediaTag" ADD CONSTRAINT "_MediaFileToMediaTag_B_fkey" FOREIGN KEY ("B") REFERENCES "media_tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;
