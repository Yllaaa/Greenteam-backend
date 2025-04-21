import { relations } from 'drizzle-orm';
import { pgTable, uuid, timestamp, primaryKey } from 'drizzle-orm/pg-core';
import { users } from '../users/users';
import { groups } from './groups';

export const groupMembers = pgTable(
  'group_members',
  {
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id),
    groupId: uuid('group_id')
      .notNull()
      .references(() => groups.id),
    joinedAt: timestamp('joined_at').defaultNow().notNull(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.groupId] })],
);

export const groupMembersRelations = relations(groupMembers, ({ one }) => ({
  user: one(users, {
    fields: [groupMembers.userId],
    references: [users.id],
  }),
  group: one(groups, {
    fields: [groupMembers.groupId],
    references: [groups.id],
  }),
}));
