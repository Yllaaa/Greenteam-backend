import {
  pgEnum,
  pgTable,
  primaryKey,
  text,
  uniqueIndex,
  uuid,
  varchar,
  serial,
  integer,
  timestamp,
} from 'drizzle-orm/pg-core';
import { events, posts, topics, users } from '../schema';
import { relations } from 'drizzle-orm';
import { countries, cities } from '../schema';
export const pageCategory = pgEnum('PageCategory', ['Business', 'Project']);

export const pages = pgTable(
  'pages',
  {
    id: uuid().primaryKey().defaultRandom(),
    ownerId: uuid('owner_id')
      .notNull()
      .references(() => users.id),
    name: varchar('name').notNull(),
    description: text('description').notNull(),
    slug: varchar('slug').notNull(),
    avatar: varchar('avatar').notNull(),
    cover: varchar('cover').notNull(),
    topicId: serial('topic_id').references(() => topics.id),
    category: pageCategory('category').notNull(),
    why: varchar('why').notNull(),
    how: varchar('how').notNull(),
    what: varchar('what').notNull(),
    countryId: integer('country_id')
      .references(() => countries.id)
      .notNull(),
    cityId: integer('city_id')
      .references(() => cities.id)
      .notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [uniqueIndex('page_owner').on(table.ownerId)],
);

export const pagesRelations = relations(pages, ({ one, many }) => ({
  owner: one(users, {
    fields: [pages.ownerId],
    references: [users.id],
  }),
  topic: one(topics, {
    fields: [pages.topicId],
    references: [topics.id],
  }),
  contacts: many(pagesContacts),
  followers: many(pagesFollowers),
  events: many(events),
  posts: many(posts),
  country: one(countries, {
    fields: [pages.countryId],
    references: [countries.id],
  }),
  city: one(cities, {
    fields: [pages.cityId],
    references: [cities.id],
  }),
}));

export const pagesContacts = pgTable(
  'pages_contacts',
  {
    page_id: uuid()
      .notNull()
      .references(() => pages.id),
    name: varchar().notNull(),
    title: varchar().notNull(),
    email: varchar().notNull(),
    phone_num: varchar().notNull(),
    personal_picture: varchar(),
  },
  (table) => [primaryKey({ columns: [table.page_id, table.email] })],
);

export const pagesContactsRelations = relations(pagesContacts, ({ one }) => ({
  page: one(pages, {
    fields: [pagesContacts.page_id],
    references: [pages.id],
  }),
}));

export const pagesFollowers = pgTable(
  'pages_followers',
  {
    page_id: uuid()
      .notNull()
      .references(() => pages.id),
    user_id: uuid()
      .notNull()
      .references(() => users.id),
  },
  (table) => [primaryKey({ columns: [table.page_id, table.user_id] })],
);

export const pagesFollowersRelations = relations(pagesFollowers, ({ one }) => ({
  page: one(pages, {
    fields: [pagesFollowers.page_id],
    references: [pages.id],
  }),
  user: one(users, {
    fields: [pagesFollowers.user_id],
    references: [users.id],
  }),
}));
