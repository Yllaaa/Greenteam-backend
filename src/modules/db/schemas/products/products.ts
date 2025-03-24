import {
  pgTable,
  serial,
  integer,
  varchar,
  text,
  boolean,
  numeric,
  char,
  index,
  pgEnum,
  uuid,
} from 'drizzle-orm/pg-core';
import { cities, countries, pages, topics, users } from '../schema';
import { relations } from 'drizzle-orm';

export const sellerTypeEnum = pgEnum('seller_type', ['user', 'page']);
export const marketTypeEnum = pgEnum('market_type', [
  'local_business',
  'value_driven_business',
  'second_hand',
]);

export type MarketType = (typeof marketTypeEnum.enumValues)[number];
export type SellerType = (typeof sellerTypeEnum.enumValues)[number];

export const products = pgTable(
  'product',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    sellerId: uuid('seller_id').notNull(),
    sellerType: sellerTypeEnum('seller_type').notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    description: text('description').notNull(),
    price: numeric('price', { precision: 10, scale: 2 }).notNull(),
    isHidden: boolean('is_hidden').default(false),
    marketType: marketTypeEnum('market_type').notNull(),
    topicId: integer('topic_id')
      .references(() => topics.id)
      .notNull(),
    countryId: integer('country_id')
      .references(() => countries.id)
      .notNull(),
    districtId: integer('district_id')
      .references(() => cities.id)
      .notNull(),
  },
  (t) => [
    index('seller_id_idx').on(t.sellerId),
    index('topic_id_idx').on(t.topicId),
    index('market_type_idx').on(t.marketType, t.isHidden),
    index('price_idx').on(t.price),
    index('product_country_id_idx').on(t.countryId),
    index('product_district_id_idx').on(t.districtId),
  ],
);

export const productsRelations = relations(products, ({ one }) => ({
  topic: one(topics, {
    fields: [products.topicId],
    references: [topics.id],
  }),
  country: one(countries, {
    fields: [products.countryId],
    references: [countries.id],
  }),
  district: one(cities, {
    fields: [products.districtId],
    references: [cities.id],
  }),
  userSeller: one(users, {
    fields: [products.sellerId],
    references: [users.id],
  }),
  pageSeller: one(pages, {
    fields: [products.sellerId],
    references: [pages.id],
  }),
}));
