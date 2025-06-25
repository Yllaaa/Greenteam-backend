import { is, relations, sql } from 'drizzle-orm';
import {
  pgTable,
  varchar,
  uuid,
  timestamp,
  pgEnum,
  uniqueIndex,
  serial,
  integer,
  unique,
  boolean,
} from 'drizzle-orm/pg-core';
import { users } from '../users/users';
import { topics } from '../topics/topics';
import { posts } from '../schema';
import { groupMembers, cities, countries } from '../schema';

export const privacy = pgEnum('privacy', ['PUBLIC', 'PRIVATE']);

export const groups = pgTable(
  'groups',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    ownerId: uuid('owner_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 255 }).notNull(),
    description: varchar('description', { length: 255 }).notNull(),
    banner: varchar('banner', { length: 255 }),
    topicId: serial('topic_id')
      .notNull()
      .references(() => topics.id, { onDelete: 'cascade' }),
    countryId: integer('country_id').references(() => countries.id),
    cityId: integer('city_id').references(() => cities.id),
    isVerified: boolean('is_verified').default(false),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').$onUpdate(() => new Date()),
  },
  (table) => {
    return {
      groupNameIdx: uniqueIndex('group_name_idx').on(table.name),
    };
  },
);

export const groupsRelations = relations(groups, ({ one, many }) => ({
  owner: one(users, {
    fields: [groups.ownerId],
    references: [users.id],
  }),
  topic: one(topics, {
    fields: [groups.topicId],
    references: [topics.id],
  }),
  members: many(groupMembers),
  posts: many(posts),
}));

export const groupNotes = pgTable(
  'group_notes',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    groupId: uuid('group_id')
      .notNull()
      .references(() => groups.id, { onDelete: 'cascade' }),
    creatorId: uuid('creator_id').references(() => users.id, {
      onDelete: 'cascade',
    }),
    title: varchar('title', { length: 255 }).notNull(),
    content: varchar('content', { length: 255 }).notNull(),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').$onUpdate(() => new Date()),
  },
  (table) => {
    return {
      uniqueGroupId: unique('unique_note_group_id').on(table.groupId),
      groupNoteIdx: uniqueIndex('group_note_idx').on(table.title),
    };
  },
);

export const groupNotesRelations = relations(groupNotes, ({ one }) => ({
  group: one(groups, {
    fields: [groupNotes.groupId],
    references: [groups.id],
  }),
  creator: one(users, {
    fields: [groupNotes.creatorId],
    references: [users.id],
  }),
}));
