-- Align preview/staging photos schema with Prisma model expectations.
-- Safe to run repeatedly due IF NOT EXISTS.
ALTER TABLE "public"."photos"
  ADD COLUMN IF NOT EXISTS "nft" TEXT,
  ADD COLUMN IF NOT EXISTS "labels" TEXT,
  ADD COLUMN IF NOT EXISTS "all_tags" TEXT,
  ADD COLUMN IF NOT EXISTS "width" INTEGER,
  ADD COLUMN IF NOT EXISTS "height" INTEGER,
  ADD COLUMN IF NOT EXISTS "download_page" TEXT,
  ADD COLUMN IF NOT EXISTS "credit_web" TEXT,
  ADD COLUMN IF NOT EXISTS "photographer" TEXT;
