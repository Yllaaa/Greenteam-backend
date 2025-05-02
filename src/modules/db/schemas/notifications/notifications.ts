import {
  pgEnum,
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  jsonb,
  index,
} from 'drizzle-orm/pg-core';
import { users } from '../schema';
import { relations } from 'drizzle-orm';

export const interactionTypeEnum = pgEnum('interaction_type', [
  'reaction',
  'comment',
  'reply',
  'followed_user',
  'followed_page',
  'joined_group',
  'joined_event',
]);
export type InteractionType = (typeof interactionTypeEnum.enumValues)[number];

export const notifications = pgTable(
  'notifications',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    recipientId: uuid('recipient_id')
      .notNull()
      .references(() => users.id),
    actorId: uuid('actor_id').references(() => users.id),
    type: interactionTypeEnum('type').notNull(),
    metadata: jsonb('metadata').notNull(),
    messageEn: text('message_en').notNull(),
    messageEs: text('message_es').notNull(),
    isRead: boolean('is_read').default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index('notification_recipient_id_idx').on(table.recipientId),
    index('notification_is_read_idx').on(table.isRead),
  ],
);

export const notificationsRelations = relations(notifications, ({ one }) => ({
  recipient: one(users, {
    fields: [notifications.recipientId],
    references: [users.id],
  }),
  actor: one(users, {
    fields: [notifications.actorId],
    references: [users.id],
  }),
}));
