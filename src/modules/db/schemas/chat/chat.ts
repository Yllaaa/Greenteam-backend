import { relations } from 'drizzle-orm';
import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
  varchar,
  index,
} from 'drizzle-orm/pg-core';
import { pages, users } from '../schema';

export const conversations = pgTable(
  'conversations',
  {
    id: serial('id').primaryKey(),
    participantAId: integer('participant_a_id').notNull(),
    participantAType: text('participant_a_type').notNull(),
    participantBId: integer('participant_b_id').notNull(),
    participantBType: text('participant_b_type').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    participantAIndex: index('conversation_participant_a_idx').on(
      table.participantAId,
      table.participantAType,
    ),
    participantBIndex: index('conversation_participant_b_idx').on(
      table.participantBId,
      table.participantBType,
    ),
  }),
);

export const messages = pgTable(
  'chat_messages',
  {
    id: serial('id').primaryKey(),
    conversationId: integer('conversation_id')
      .notNull()
      .references(() => conversations.id, { onDelete: 'cascade' }),
    senderId: integer('sender_id').notNull(),
    senderType: text('sender_type').notNull(),
    content: text('content').notNull(),
    mediaUrl: varchar('media_url'),
    sentAt: timestamp('created_at').defaultNow().notNull(),
    seenAt: timestamp('seen_at'),
  },
  (table) => ({
    conversationIndex: index('message_conversation_idx').on(
      table.conversationId,
    ),
    senderIndex: index('message_sender_idx').on(
      table.senderId,
      table.senderType,
    ),
  }),
);

export const conversationRelations = relations(
  conversations,
  ({ one, many }) => ({
    messages: many(messages),
    participantAUser: one(users, {
      fields: [conversations.participantAId],
      references: [users.id],
    }),
    participantAPage: one(pages, {
      fields: [conversations.participantAId],
      references: [pages.id],
    }),
    participantBUser: one(users, {
      fields: [conversations.participantBId],
      references: [users.id],
    }),
    participantBPage: one(pages, {
      fields: [conversations.participantBId],
      references: [pages.id],
    }),
  }),
);

export const messageRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id],
  }),
  senderUser: one(users, {
    fields: [messages.senderId],
    references: [users.id],
  }),
  senderPage: one(pages, {
    fields: [messages.senderId],
    references: [pages.id],
  }),
}));
