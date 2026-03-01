-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "users" (
    "id" VARCHAR(255) NOT NULL,
    "philoart_id" INTEGER,
    "username" VARCHAR(255),
    "password" TEXT,
    "profile_image" TEXT,
    "first_name" TEXT,
    "last_name" TEXT,
    "email" TEXT,
    "description" TEXT,
    "social_media_link" TEXT,
    "download_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "photos" (
    "id" VARCHAR(255) NOT NULL,
    "user_id" VARCHAR(255),
    "nft" TEXT,
    "title" TEXT,
    "year" INTEGER,
    "description" TEXT,
    "tags" TEXT,
    "labels" TEXT,
    "all_tags" TEXT,
    "image_key" TEXT,
    "width" INTEGER,
    "height" INTEGER,
    "src_tiny" TEXT,
    "src_small" TEXT,
    "src_large" TEXT,
    "src_original" TEXT,
    "src_youtube" TEXT,
    "color" TEXT,
    "all_colors" TEXT,
    "download_count" TEXT,
    "download_page" TEXT,
    "credit_id" TEXT,
    "credit_web" TEXT,
    "photographer" TEXT,
    "license" TEXT,
    "type" TEXT,
    "status" TEXT,
    "allow_download" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "photos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "collections" (
    "id" VARCHAR(255) NOT NULL,
    "user_id" VARCHAR(255),
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "cover" TEXT,
    "public" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "collections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "collected_photos" (
    "id" VARCHAR(255) NOT NULL,
    "user_id" VARCHAR(255),
    "photo_id" VARCHAR(255),
    "collection_id" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "collected_photos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "likes" (
    "id" VARCHAR(255) NOT NULL,
    "user_id" VARCHAR(255),
    "photo_id" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "likes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "follows" (
    "id" VARCHAR(255) NOT NULL,
    "user_id" VARCHAR(255),
    "following_id" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "follows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "photo_reviews" (
    "id" VARCHAR(255) NOT NULL,
    "user_id" VARCHAR(255),
    "photo_id" VARCHAR(255),
    "text" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "photo_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "collection_reviews" (
    "id" VARCHAR(255) NOT NULL,
    "user_id" VARCHAR(255),
    "collection_id" VARCHAR(255),
    "text" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "collection_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "informations" (
    "id" VARCHAR(255) NOT NULL,
    "name" VARCHAR(255),
    "value" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "informations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "emails" (
    "id" VARCHAR(255) NOT NULL,
    "user_id" VARCHAR(255),
    "email" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "emails_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_philoart_id_key" ON "users"("philoart_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE INDEX "users_username_idx" ON "users"("username");

-- CreateIndex
CREATE INDEX "photos_user_id_idx" ON "photos"("user_id");

-- CreateIndex
CREATE INDEX "collections_title_user_id_idx" ON "collections"("title", "user_id");

-- CreateIndex
CREATE INDEX "collected_photos_photo_id_collection_id_user_id_idx" ON "collected_photos"("photo_id", "collection_id", "user_id");

-- CreateIndex
CREATE INDEX "likes_photo_id_user_id_idx" ON "likes"("photo_id", "user_id");

-- CreateIndex
CREATE INDEX "follows_user_id_following_id_idx" ON "follows"("user_id", "following_id");

-- CreateIndex
CREATE INDEX "photo_reviews_photo_id_user_id_idx" ON "photo_reviews"("photo_id", "user_id");

-- CreateIndex
CREATE INDEX "collection_reviews_collection_id_user_id_idx" ON "collection_reviews"("collection_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "informations_name_key" ON "informations"("name");

-- CreateIndex
CREATE INDEX "informations_name_idx" ON "informations"("name");

-- CreateIndex
CREATE UNIQUE INDEX "emails_email_key" ON "emails"("email");

-- CreateIndex
CREATE INDEX "emails_email_idx" ON "emails"("email");

-- AddForeignKey
ALTER TABLE "photos" ADD CONSTRAINT "photos_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collections" ADD CONSTRAINT "collections_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collected_photos" ADD CONSTRAINT "collected_photos_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collected_photos" ADD CONSTRAINT "collected_photos_photo_id_fkey" FOREIGN KEY ("photo_id") REFERENCES "photos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collected_photos" ADD CONSTRAINT "collected_photos_collection_id_fkey" FOREIGN KEY ("collection_id") REFERENCES "collections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "likes" ADD CONSTRAINT "likes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "likes" ADD CONSTRAINT "likes_photo_id_fkey" FOREIGN KEY ("photo_id") REFERENCES "photos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "follows" ADD CONSTRAINT "follows_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "follows" ADD CONSTRAINT "follows_following_id_fkey" FOREIGN KEY ("following_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "photo_reviews" ADD CONSTRAINT "photo_reviews_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "photo_reviews" ADD CONSTRAINT "photo_reviews_photo_id_fkey" FOREIGN KEY ("photo_id") REFERENCES "photos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collection_reviews" ADD CONSTRAINT "collection_reviews_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collection_reviews" ADD CONSTRAINT "collection_reviews_collection_id_fkey" FOREIGN KEY ("collection_id") REFERENCES "collections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emails" ADD CONSTRAINT "emails_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

