DO $$ BEGIN
 CREATE TYPE "public"."positions" AS ENUM('top', 'bottom', 'left', 'right');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "message" ADD COLUMN "created_from" "positions";

ALTER TABLE "message" ADD COLUMN "x_position" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "message" ADD COLUMN "y_position" integer NOT NULL;