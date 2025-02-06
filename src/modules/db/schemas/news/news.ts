import { pgTable, uuid, varchar, date } from "drizzle-orm/pg-core";
import { blogs } from "../schema";
import { relations } from 'drizzle-orm';

export const news = pgTable('news', {
    id: uuid().defaultRandom().primaryKey(),
    title: varchar(),
    content: varchar(),
    image: varchar(),
    url: varchar(),
    published_at: date(),
    blog_id: uuid().references(() => blogs.id)
})

export const newsRelations = relations(news, ({ one }) => ({
    blog: one(blogs, { fields: [news.blog_id], references: [blogs.id] })
}));