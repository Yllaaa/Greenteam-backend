import { pgEnum, pgTable, text, uuid, varchar } from "drizzle-orm/pg-core";
import { topics, users } from "../schema";
import { relations } from "drizzle-orm";

export const pageCategory = pgEnum('PageCategory', ['Business', 'Project'])

export const pages = pgTable('pages', {
    id: uuid().primaryKey().defaultRandom(),
    owner_id: uuid().notNull().references(() => users.id),
    name: varchar().notNull(),
    description: text().notNull(),
    slug: varchar().notNull(),
    avatar: varchar().notNull(),
    cover: varchar().notNull(),
    topic_id: uuid().references(() => topics.id),
    category: pageCategory().notNull(),
    page_info_id: uuid()
})

export const pagesRelations = relations(pages, ({ one }) => ({
    owner: one(users, {
        fields: [pages.owner_id],
        references: [users.id]
    }),
    topic: one(topics, {
        fields: [pages.topic_id],
        references: [topics.id]
    })
}))