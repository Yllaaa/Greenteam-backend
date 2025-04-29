import {
  pgEnum,
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
} from 'drizzle-orm/pg-core';
import { users } from '../schema';

export const interactionTypeEnum = pgEnum('interaction_type', [
  'like',
  'comment',
  'follow',
  'reply',
]);

export const entityTypeEnum = pgEnum('entity_type', [
  'post',
  'comment',
  'user',
]);

export const notifications = pgTable('notifications', {
  id: uuid('id').defaultRandom().primaryKey(),
  recipientId: uuid('recipient_id')
    .notNull()
    .references(() => users.id),
  actorId: uuid('actor_id').references(() => users.id),
  type: interactionTypeEnum('type').notNull(),
  entityType: entityTypeEnum('entity_type').notNull(),
  entityId: uuid('entity_id').notNull(),
  message: text('message'),
  isRead: boolean('is_read').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});
