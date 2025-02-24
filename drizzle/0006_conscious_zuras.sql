ALTER TABLE "chat_messages" ADD COLUMN "sent_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
CREATE INDEX "messages_sent_at_id_index" ON "chat_messages" USING btree ("sent_at","id");--> statement-breakpoint
ALTER TABLE "chat_messages" DROP COLUMN "created_at";