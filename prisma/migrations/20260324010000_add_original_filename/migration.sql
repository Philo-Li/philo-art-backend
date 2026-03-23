-- Add original filename field for deduplication
ALTER TABLE "photos" ADD COLUMN "original_filename" TEXT;
