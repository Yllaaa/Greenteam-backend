CREATE TYPE "public"."message_sender_type" AS ENUM('user', 'page');--> statement-breakpoint
CREATE TABLE "conversations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"participant_a_id" uuid NOT NULL,
	"participant_a_type" "message_sender_type" NOT NULL,
	"participant_b_id" uuid NOT NULL,
	"participant_b_type" "message_sender_type" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "chat_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"conversation_id" uuid NOT NULL,
	"sender_id" uuid NOT NULL,
	"sender_type" "message_sender_type" NOT NULL,
	"content" text NOT NULL,
	"media_url" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"seen_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "conversation_participant_a_idx" ON "conversations" USING btree ("participant_a_id","participant_a_type");--> statement-breakpoint
CREATE INDEX "conversation_participant_b_idx" ON "conversations" USING btree ("participant_b_id","participant_b_type");--> statement-breakpoint
CREATE INDEX "message_conversation_idx" ON "chat_messages" USING btree ("conversation_id");--> statement-breakpoint
CREATE INDEX "message_sender_idx" ON "chat_messages" USING btree ("sender_id","sender_type");