import { pgEnum, pgTable, primaryKey, text, uniqueIndex, uuid, varchar } from "drizzle-orm/pg-core";
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
}, (table) => [
    uniqueIndex('page_owner').on(table.owner_id)
])

export const pagesRelations = relations(pages, ({ one, many }) => ({
    owner: one(users, {
        fields: [pages.owner_id],
        references: [users.id]
    }),
    topic: one(topics, {
        fields: [pages.topic_id],
        references: [topics.id]
    }),
    contacts: many(pagesContacts),
    likes: many(pagesLikes)
}))

export const pagesContacts = pgTable('pages_contacts',{
    page_id: uuid().notNull().references(() => pages.id),
    name: varchar().notNull(),
    title: varchar().notNull(),
    email: varchar().notNull(),
    phone_num: varchar().notNull(),
    personal_picture: varchar()
}, (table) => [
    primaryKey({columns: [table.page_id, table.email]})
])

export const pagesContactsRelations = relations(pagesContacts, ({one}) => ({
    page: one(pages,{
        fields: [pagesContacts.page_id],
        references: [pages.id]
    })
}))

export const pagesLikes = pgTable('pages_likes',{
    page_id: uuid().notNull().references(() => pages.id),
    user_id: uuid().notNull().references(() => users.id)
}, (table) => [
    primaryKey({columns: [table.page_id, table.user_id]})
])

export const pagesLikesRelations = relations(pagesLikes, ({one}) => ({
    page: one(pages, {
        fields: [pagesLikes.page_id],
        references: [pages.id]
    }),
    user: one(users, {
        fields: [pagesLikes.user_id],
        references: [users.id]
    })
}))