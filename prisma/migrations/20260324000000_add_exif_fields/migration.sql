-- Add EXIF metadata fields to photos table
ALTER TABLE "photos" ADD COLUMN "camera_make" TEXT;
ALTER TABLE "photos" ADD COLUMN "camera_model" TEXT;
ALTER TABLE "photos" ADD COLUMN "lens" TEXT;
ALTER TABLE "photos" ADD COLUMN "focal_length" DOUBLE PRECISION;
ALTER TABLE "photos" ADD COLUMN "aperture" DOUBLE PRECISION;
ALTER TABLE "photos" ADD COLUMN "shutter_speed" TEXT;
ALTER TABLE "photos" ADD COLUMN "iso" INTEGER;
ALTER TABLE "photos" ADD COLUMN "date_taken" TIMESTAMP(3);
ALTER TABLE "photos" ADD COLUMN "gps_latitude" DOUBLE PRECISION;
ALTER TABLE "photos" ADD COLUMN "gps_longitude" DOUBLE PRECISION;
ALTER TABLE "photos" ADD COLUMN "exif_data" JSONB;
