ALTER TABLE "message" ALTER COLUMN "image_url" TYPE text[] USING ARRAY["image_url"];