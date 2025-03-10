import {
  pgEnum,
  pgTable,
  varchar,
  date,
  uuid,
  text,
  smallint,
  primaryKey,
  timestamp,
  serial,
} from 'drizzle-orm/pg-core';
import { creatorTypeEnum, topics, users, groups } from '../schema';
import { relations } from 'drizzle-orm';

export const EventCategory = pgEnum('Event Category', [
  'social',
  'volunteering&work',
  'talks&workshops',
]);

export const events = pgTable('events', {
  id: uuid().primaryKey().defaultRandom(),
  creatorId: uuid('creator_id').notNull(),
  creatorType: creatorTypeEnum('creator_type').notNull(),
  title: varchar().notNull(),
  description: text(),
  location: varchar().notNull(),
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
  category: EventCategory(),
  poster: varchar(),
  priority: smallint().notNull().default(0),
  topicId: serial('topic_id')
    .notNull()
    .references(() => topics.id),
  groupId: uuid('group_id').references(() => groups.id),
  createdAt: timestamp().notNull().defaultNow(),
});

export const events_relations = relations(events, ({ one, many }) => ({
  usersJoined: many(usersJoinedEvent),
  userCreator: one(users, {
    fields: [events.creatorId],
    references: [users.id],
  }),
  topic: one(topics, {
    fields: [events.topicId],
    references: [topics.id],
  }),
  group: one(groups, {
    fields: [events.groupId],
    references: [groups.id],
  }),
}));

export const usersJoinedEvent = pgTable(
  'users_joined_event',
  {
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id),
    eventId: uuid('event_id')
      .notNull()
      .references(() => events.id),
  },
  (table) => [primaryKey({ columns: [table.eventId, table.userId] })],
);

export const usersJoinedEventRelations = relations(
  usersJoinedEvent,
  ({ one }) => ({
    user: one(users, {
      fields: [usersJoinedEvent.userId],
      references: [users.id],
    }),
    event: one(events, {
      fields: [usersJoinedEvent.eventId],
      references: [events.id],
    }),
  }),
);