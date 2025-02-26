import { relations, asc } from 'drizzle-orm';
import {
  pgTable,
  text,
  timestamp,
  varchar,
  index,
  uuid,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { pages, users } from '../schema';

export const messageSenderType = pgEnum('message_sender_type', [
  'user',
  'page',
]);

export const conversations = pgTable(
  'conversations',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    participantAId: uuid('participant_a_id').notNull(),
    participantAType: messageSenderType('participant_a_type').notNull(),
    participantBId: uuid('participant_b_id').notNull(),
    participantBType: messageSenderType('participant_b_type').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('conversation_participant_a_idx').on(
      table.participantAId,
      table.participantAType,
    ),
    index('conversation_participant_b_idx').on(
      table.participantBId,
      table.participantBType,
    ),
  ],
);

export const messages = pgTable(
  'chat_messages',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    conversationId: uuid('conversation_id')
      .notNull()
      .references(() => conversations.id),
    senderId: uuid('sender_id').notNull(),
    senderType: messageSenderType('sender_type').notNull(),
    content: text('content').notNull(),
    mediaUrl: varchar('media_url'),
    sentAt: timestamp('sent_at').defaultNow().notNull(),
    seenAt: timestamp('seen_at'),
  },
  (table) => [
    index('message_conversation_idx').on(table.conversationId),
    index('message_sender_idx').on(table.senderId, table.senderType),
    index('messages_sent_at_id_index').on(table.sentAt, table.id),
  ],
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
