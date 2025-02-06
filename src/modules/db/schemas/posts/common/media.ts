import { pgTable, uuid, varchar, timestamp, index } from 'drizzle-orm/pg-core';
import { mediaParentTypeEnum, mediaTypeEnum } from '../enums';

export const media = pgTable('media', {
  id: uuid('id').primaryKey().defaultRandom(),
  parentId: uuid('parent_id'),
  parentType: mediaParentTypeEnum('parent_type').notNull(),
  mediaUrl: varchar('media_url', { length: 2048 }),
  mediaType: mediaTypeEnum('media_type').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
