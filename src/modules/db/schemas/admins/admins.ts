import {
  pgTable,
  varchar,
  uuid,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

export const admins = pgTable(
  'admins',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    password: varchar('password', { length: 255 }).notNull(),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => [uniqueIndex('admin_email_idx').on(table.email)],
);
