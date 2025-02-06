import { pgEnum, pgTable, uuid, varchar } from "drizzle-orm/pg-core";
import { news, users } from "../schema";
import { relations } from "drizzle-orm";

export const blogType = pgEnum("BLOG_TYPE", ["BLOGGER"]);

export const blogs = pgTable("Blogs", {
    id: uuid("id").defaultRandom().primaryKey(),
    url: varchar("url").notNull(),
    user_id: uuid("user_id").notNull().references(() => users.id),
    type: blogType("type").notNull()
}
);

export const blogsRelations = relations(blogs, ({ one, many }) => ({
    user: one(users, { fields: [blogs.user_id], references: [users.id] }),
    news_posts: many(news)
}));