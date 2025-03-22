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
} from 'drizzle-orm/pg-core';
import { cities, countries, topics } from '../schema';
import { relations } from 'drizzle-orm';

export const sellerTypeEnum = pgEnum('seller_type', ['user', 'page']);
export const marketTypeEnum = pgEnum('market_type', [
  'local_business',
  'value_driven_business',
  'second_hand',
]);

export const products = pgTable(
  'product',
  {
    id: serial('id').primaryKey(),
    sellerId: integer('seller_id').notNull(),
    sellerType: sellerTypeEnum('seller_type').notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    description: text('description'),
    price: numeric('price', { precision: 10, scale: 2 }),
    isHidden: boolean('is_hidden').default(false),
    marketType: marketTypeEnum('market_type'),
    topicId: integer('topic_id').references(() => topics.id),
    countryId: integer('country_id').references(() => countries.id),
    district: integer('district_id').references(() => cities.id),
  },
  (t) => [
    index('seller_id_idx').on(t.sellerId),
    index('topic_id_idx').on(t.topicId),
    index('market_type_idx').on(t.marketType, t.isHidden),
    index('price_idx').on(t.price),
    index('product_country_id_idx').on(t.countryId),
    index('product_district_id_idx').on(t.district),
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
    fields: [products.district],
    references: [cities.id],
  }),
}));
