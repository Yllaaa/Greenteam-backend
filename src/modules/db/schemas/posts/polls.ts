import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  foreignKey,
} from 'drizzle-orm/pg-core';

import { users } from '../users/users';
import { relations } from 'drizzle-orm';
import { posts } from './posts';
import { pollParentTypeEnum } from './enums';

export const polls = pgTable('polls', {
  id: uuid('id').primaryKey().defaultRandom(),
  parentType: pollParentTypeEnum('parent_type').notNull(),
  parentId: uuid('parent_id').notNull(),
  question: text('question').notNull(),
  closesAt: timestamp('closes_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const pollOptions = pgTable('poll_options', {
  id: uuid('id').primaryKey().defaultRandom(),
  pollId: uuid('poll_id')
    .references(() => polls.id)
    .notNull(),
  optionText: varchar('option_text', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const pollVotes = pgTable('poll_votes', {
  id: uuid('id').primaryKey().defaultRandom(),
  optionId: uuid('option_id')
    .references(() => pollOptions.id)
    .notNull(),
  voterId: uuid('voter_id')
    .notNull()
    .references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const pollsRelations = relations(polls, ({ one, many }) => ({
  post: one(posts, {
    fields: [polls.parentId],
    references: [posts.id],
  }),
  options: many(pollOptions),
}));

export const pollOptionsRelations = relations(pollOptions, ({ one, many }) => ({
  poll: one(polls, {
    fields: [pollOptions.pollId],
    references: [polls.id],
  }),
  votes: many(pollVotes),
}));

export const pollVotesRelations = relations(pollVotes, ({ one }) => ({
  option: one(pollOptions, {
    fields: [pollVotes.optionId],
    references: [pollOptions.id],
  }),
}));
