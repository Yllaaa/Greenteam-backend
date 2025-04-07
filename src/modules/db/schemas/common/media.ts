import { pgTable, uuid, varchar, timestamp, index } from 'drizzle-orm/pg-core';
import { mediaParentTypeEnum, mediaTypeEnum } from '../posts/enums';

export const entitiesMedia = pgTable(
  'entities_media',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    parentId: uuid('parent_id'),
    parentType: mediaParentTypeEnum('parent_type').notNull(),
    mediaUrl: varchar('media_url', { length: 2048 }),
    mediaType: mediaTypeEnum('media_type').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('media_parent_id_idx').on(table.parentId),
    index('media_type_idx').on(table.mediaType),
  ],
);
