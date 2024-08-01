ALTER TABLE "message" RENAME COLUMN "model_id" TO "model_name";--> statement-breakpoint
ALTER TABLE "message" DROP CONSTRAINT "message_model_id_model_id_fk";
--> statement-breakpoint
ALTER TABLE "model" DROP COLUMN IF EXISTS "id";
--> statement-breakpoint
ALTER TABLE "model" ADD PRIMARY KEY ("name");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "message" ADD CONSTRAINT "message_model_name_model_name_fk" FOREIGN KEY ("model_name") REFERENCES "public"."model"("name") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;