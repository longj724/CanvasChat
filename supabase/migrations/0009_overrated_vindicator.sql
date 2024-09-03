ALTER TABLE "message" ADD COLUMN "context" text;--> statement-breakpoint
ALTER TABLE "message" ADD COLUMN "is_system_message" boolean DEFAULT false;