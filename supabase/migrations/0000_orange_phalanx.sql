CREATE TABLE IF NOT EXISTS "chat" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"spaceId" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "chats_to_messages" (
	"chat_id" text NOT NULL,
	"message_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "message" (
	"id" text PRIMARY KEY NOT NULL,
	"content" text,
	"response" text,
	"model_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "model" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"display_name" text,
	"context_window" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ollama" (
	"id" text PRIMARY KEY NOT NULL,
	"base_url" text NOT NULL,
	"userId" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "openai_key" (
	"id" text PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"userId" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "space" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"userId" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "chat" ADD CONSTRAINT "chat_spaceId_space_id_fk" FOREIGN KEY ("spaceId") REFERENCES "public"."space"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "chats_to_messages" ADD CONSTRAINT "chats_to_messages_chat_id_chat_id_fk" FOREIGN KEY ("chat_id") REFERENCES "public"."chat"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "chats_to_messages" ADD CONSTRAINT "chats_to_messages_message_id_message_id_fk" FOREIGN KEY ("message_id") REFERENCES "public"."message"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "message" ADD CONSTRAINT "message_model_id_model_id_fk" FOREIGN KEY ("model_id") REFERENCES "public"."model"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
