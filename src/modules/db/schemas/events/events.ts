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
import { creatorTypeEnum, topics, users, groups, pages } from '../schema';
import { relations } from 'drizzle-orm';

export const EventCategory = pgEnum('event_category', [
  'social',
  'volunteering&work',
  'talks&workshops',
]);

export const EventHostedBy = pgEnum('event_hosted_by', [
  'Global',
  'Greenteam',
  'user',
  'page',
]);

export const events = pgTable('events', {
  id: uuid().primaryKey().defaultRandom(),
  creatorId: uuid('creator_id'),
  creatorType: creatorTypeEnum('creator_type'),
  title: varchar().notNull(),
  description: text(),
  location: varchar().notNull(),
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
  category: EventCategory(),
  hostedBy: EventHostedBy(),
  poster: varchar(),
  priority: smallint().notNull().default(0),

  groupId: uuid('group_id').references(() => groups.id),
  createdAt: timestamp().notNull().defaultNow(),
});

export const events_relations = relations(events, ({ one, many }) => ({
  usersJoined: many(usersJoinedEvent),
  userCreator: one(users, {
    fields: [events.creatorId],
    references: [users.id],
  }),
  pageCreator: one(pages, {
    fields: [events.creatorId],
    references: [pages.id],
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
