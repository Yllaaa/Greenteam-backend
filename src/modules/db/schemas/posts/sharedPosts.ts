import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  foreignKey,
  index,
} from 'drizzle-orm/pg-core';
import { posts } from './posts';
import { creatorTypeEnum, sharedEntityTypeEnum } from './enums';
import { relations } from 'drizzle-orm';

export const sharedPosts = pgTable(
  'shared_posts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    postId: uuid('post_id')
      .references(() => posts.id)
      .notNull()
      .unique(),
    sharedEntityType: sharedEntityTypeEnum('shared_entity_type').notNull(),
    sharedEntityId: uuid('shared_entity_id').notNull(),
    sharedByType: creatorTypeEnum('shared_by_type').notNull(),
    sharedById: uuid('shared_by_id').notNull(),
    sharedAt: timestamp('shared_at').defaultNow().notNull(),
  },
  (table) => ({
    sharedEntityIdx: index('shared_entity_idx').on(
      table.sharedEntityType,
      table.sharedEntityId,
    ),
  }),
);

export const sharedPostRelations = relations(sharedPosts, ({ one }) => ({
  post: one(posts, {
    fields: [sharedPosts.postId],
    references: [posts.id],
  }),
  sharedPost: one(posts, {
    fields: [sharedPosts.sharedEntityId],
    references: [posts.id],
  }),
}));
