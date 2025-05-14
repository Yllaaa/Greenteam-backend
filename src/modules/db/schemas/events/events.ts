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
  index,
  integer,
} from 'drizzle-orm/pg-core';
import {
  creatorTypeEnum,
  topics,
  users,
  groups,
  pages,
  countries,
  cities,
} from '../schema';
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

export const eventModeEnum = pgEnum('event_mode', ['online', 'local']);
export type EventMode = (typeof eventModeEnum.enumValues)[number];

export const events = pgTable(
  'events',
  {
    id: uuid().primaryKey().defaultRandom(),
    creatorId: uuid('creator_id'),
    creatorType: creatorTypeEnum('creator_type'),
    title: varchar('title').notNull(),
    description: text('description').notNull(),
    location: varchar('location').notNull(),
    startDate: timestamp('start_date'),
    endDate: timestamp('end_date'),
    category: EventCategory('category'),
    hostedBy: EventHostedBy('hosted_by'),
    posterUrl: varchar('poster_url'),
    priority: smallint('priority').notNull().default(0),
    mode: eventModeEnum('mode').notNull().default('online'),
    countryId: integer('country_id').references(() => countries.id),
    cityId: integer('city_id').references(() => cities.id),
    groupId: uuid('group_id').references(() => groups.id, {
      onDelete: 'cascade',
    }),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [
    index('events_creator_id_idx').on(table.creatorId),
    index('events_start_date_idx').on(table.startDate),
    index('events_mode_idx').on(table.mode),
    index('events_group_id_idx').on(table.groupId),
    index('events_category_idx').on(table.category),
  ],
);

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
      .references(() => events.id, { onDelete: 'cascade' }),
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
