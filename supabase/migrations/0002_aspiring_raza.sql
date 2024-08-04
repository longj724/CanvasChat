DO $$ BEGIN
 CREATE TYPE "public"."positions" AS ENUM('top', 'bottom', 'left', 'right');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "message" ADD COLUMN "created_from" "positions";