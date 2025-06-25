import {
  pgEnum,
  pgTable,
  timestamp,
  uuid,
  varchar,
  text,
  index,
  unique,
} from 'drizzle-orm/pg-core';
import { users } from './users';

export const blockedEntityType = pgEnum('blocked_entity_type', [
  'user',
  'page',
]);

export const reportedEntityType = pgEnum('reported_entity_type', [
  'user',
  'page',
  'post',
  'group',
  'forum_publication',
  'comment',
  'product',
  'event',
]);

export const reportStatus = pgEnum('report_status', [
  'pending',
  'resolved',
  'ignored',
]);

const timestamps = {
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
};

export const userBlocks = pgTable(
  'user_blocks',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('blocker_id')
      .notNull()
      .references(() => users.id),
    blockedId: uuid('blocked_id').notNull(),
    blockedEntityType: blockedEntityType('blocked_type').notNull(),
    ...timestamps,
  },
  (table) => {
    return {
      blockerIdx: index('blocker_idx').on(table.userId),
      blockedEntityIdx: index('blocked_entity_idx').on(
        table.blockedId,
        table.blockedEntityType,
      ),
      user_blocked_unique: unique().on(table.userId, table.blockedId),
    };
  },
);

export const userReports = pgTable(
  'user_reports',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('reporter_id')
      .notNull()
      .references(() => users.id),
    reportedId: uuid('reported_id').notNull(),
    reportedType: reportedEntityType('reported_type').notNull(),
    reason: text('reason').notNull(),
    adminNotes: text('admin_notes'),
    status: reportStatus().default('pending').notNull(),
    ...timestamps,
  },
  (table) => ({
    reporterIdx: index('reporter_idx').on(table.userId),
    reportedEntityIdx: index('reported_entity_idx').on(
      table.reportedId,
      table.reportedType,
    ),
  }),
);
