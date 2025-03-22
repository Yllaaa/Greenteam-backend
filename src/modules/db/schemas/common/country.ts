import { relations } from 'drizzle-orm';
import { pgTable, serial, varchar, integer, index } from 'drizzle-orm/pg-core';

export const countries = pgTable(
  'countries',
  {
    id: serial('id').primaryKey(),
    nameEn: varchar('name_en', { length: 100 }).notNull(),
    nameES: varchar('name_es', { length: 100 }).notNull(),
    iso: varchar('iso', { length: 2 }).notNull(),
  },
  (table) => [
    index('country_name_en_idx').on(table.nameEn),
    index('country_name_es_idx').on(table.nameES),
    index('country_iso_idx').on(table.iso),
  ],
);

export const cities = pgTable(
  'cities',
  {
    id: serial('id').primaryKey(),
    countryId: integer('country_id').references(() => countries.id),
    nameEn: varchar('name_en', { length: 100 }).notNull(),
  },
  (table) => [
    index('cities_country_id_idx').on(table.countryId),
    index('cities_name_en_idx').on(table.nameEn),
  ],
);

export const countriesRelations = relations(countries, ({ many }) => ({
  districts: many(cities),
}));

export const districtsRelations = relations(cities, ({ one }) => ({
  country: one(countries, {
    fields: [cities.countryId],
    references: [countries.id],
  }),
}));
