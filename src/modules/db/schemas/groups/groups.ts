import { is, relations, sql } from 'drizzle-orm';
import {
  pgTable,
  varchar,
  uuid,
  timestamp,
  pgEnum,
  uniqueIndex,
  serial,
} from 'drizzle-orm/pg-core';
import { users } from '../users/users';
import { topics } from '../topics/topics';
import { posts } from '../schema';
import { groupMembers } from '../schema';

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
    // privacy: privacy().default('PRIVATE'),
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
