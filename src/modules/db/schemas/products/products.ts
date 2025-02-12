import { boolean, integer, pgEnum, pgTable, primaryKey, text, uuid, varchar } from "drizzle-orm/pg-core";
import { topics, users } from "../schema";
import { relations } from "drizzle-orm";

export const productSellerType = pgEnum('product_seller_type', ['User', 'Page'])

export const productMarketType = pgEnum('product_market_type', ['Local Businesses', 'Value Businesses', 'Sustainable Industry', 'Second-Hand Goods'])

export const products = pgTable('products',{
    id: uuid().primaryKey().defaultRandom(),
    seller_id: uuid().notNull(),
    seller_type: productSellerType().notNull(),
    name: varchar().notNull(),
    description: text().notNull(),
    price: integer().notNull(),
    is_hidden: boolean().default(false),
    market_type: productMarketType().notNull(),
    location: varchar().notNull(),
    topic_id: uuid().notNull().references(() => topics.id),
    sub_topic_id: uuid().notNull().references(() => topics.id)
})

export const productsRelations = relations(products,({one, many})=>({
    reviews: many(productReviews),
    topic: one(topics,{
        fields: [products.topic_id],
        references: [topics.id]
    }),
    subTopic: one(topics,{
        fields: [products.sub_topic_id],
        references: [topics.id]
    })
}))

export const productReviews = pgTable('product_reviews',{
    product_id: uuid().notNull().references(() => products.id),
    user_id: uuid().notNull().references(() => users.id),
    rating_value: integer().notNull(),
    review: varchar().notNull(),
    is_unsustainable: boolean().default(false)
}, (table)=>[
    primaryKey({columns: [table.product_id, table.user_id]})
])

export const productReviewsRelation = relations(productReviews, ({one}) => ({
    product: one(products,{
        fields: [productReviews.product_id],
        references: [products.id],
    }),
    user: one(users,{
        fields: [productReviews.user_id],
        references: [users.id]
    })
}))