import { Injectable } from '@nestjs/common';
import { DrizzleService } from '../db/drizzle.service';
import { and, asc, desc, eq, ilike, sql } from 'drizzle-orm';
import { cities, countries, topics } from '../db/schemas/schema';
@Injectable()
export class CommonRepository {
  constructor(private readonly drizzleService: DrizzleService) {}

  async getTopics(query: { tree?: boolean }) {
    const topics = await this.drizzleService.db.query.topics.findMany({
      columns: {
        id: true,
        name: true,
        parentId: true,
      },
    });

    if (!query.tree) return topics;

    const topicMap = new Map();
    topics.forEach((topic) => {
      topicMap.set(topic.id, {
        id: topic.id,
        name: topic.name,
        subtopics: undefined,
      });
    });

    const rootTopics: { id: any; name: any; subtopics?: any }[] = [];
    topics.forEach((topic) => {
      if (topic.parentId) {
        const parent = topicMap.get(topic.parentId);
        if (parent) {
          if (!parent.subtopics) parent.subtopics = [];
          parent.subtopics.push(topicMap.get(topic.id));
        }
      } else {
        rootTopics.push(topicMap.get(topic.id));
      }
    });

    const cleanTree = (nodes) => {
      return nodes.map((node) => {
        if (!node.subtopics) {
          const { subtopics, ...cleanNode } = node;
          return cleanNode;
        }
        node.subtopics = cleanTree(node.subtopics);
        return node;
      });
    };

    return cleanTree(rootTopics);
  }

  async getMainTopics() {
    return await this.drizzleService.db.query.topics.findMany({
      columns: {
        id: true,
        name: true,
        parentId: true,
      },
      where: (topics, { isNull }) => isNull(topics.parentId),
    });
  }

  async getAllCountries(locale?: string) {
    return await this.drizzleService.db.query.countries.findMany({
      columns: {
        id: true,
        nameEn: true,
        nameEs: true,
        iso: true,
      },
      orderBy: (countries, { asc }) => [
        asc(countries[locale === 'en' ? 'nameEn' : 'nameEs']),
      ],
    });
  }

  async insertCity(cityData: { countryId: number; nameEn: string }) {
    const existingCity = await this.drizzleService.db
      .select()
      .from(cities)
      .where(
        eq(cities.countryId, cityData.countryId) &&
          eq(cities.nameEn, cityData.nameEn),
      )
      .limit(1);

    if (existingCity.length > 0) {
      return existingCity[0];
    }

    // Insert new city
    const [newCity] = await this.drizzleService.db
      .insert(cities)
      .values({
        countryId: cityData.countryId,
        nameEn: cityData.nameEn,
      })
      .returning();

    return newCity;
  }

  async searchCitiesForDropdown(params: {
    countryId: number;
    search?: string;
    limit?: number;
  }): Promise<{ id: number; nameEn: string; position?: number }[]> {
    const { countryId, search, limit = 10 } = params;

    const query = this.drizzleService.db
      .select({
        id: cities.id,
        nameEn: cities.nameEn,
        ...(search
          ? {
              position: sql<number>`position(lower(${search}) in lower(${cities.nameEn}))`,
            }
          : {}),
      })
      .from(cities)
      .where(
        and(
          eq(cities.countryId, countryId),
          search ? ilike(cities.nameEn, `%${search}%`) : undefined,
        ),
      )
      .orderBy(
        ...(search
          ? [
              sql`position(lower(${search}) in lower(${cities.nameEn}))`,
              asc(cities.nameEn),
            ]
          : [asc(cities.nameEn)]),
      );

    if (limit) {
      return query.limit(limit);
    }

    if (!search && limit !== null) {
      return query.limit(50);
    }

    return query;
  }

  async countryExists(countryId: number): Promise<boolean> {
    const result = await this.drizzleService.db
      .select({ id: countries.id })
      .from(countries)
      .where(eq(countries.id, countryId))
      .limit(1);

    return result.length > 0;
  }

  async cityExistsInCountry(
    cityId: number,
    countryId: number,
  ): Promise<boolean> {
    const result = await this.drizzleService.db
      .select({ id: cities.id })
      .from(cities)
      .where(and(eq(cities.id, cityId), eq(cities.countryId, countryId)))
      .limit(1);

    return result.length > 0;
  }

  async topicExists(topicId: number): Promise<boolean> {
    const result = await this.drizzleService.db
      .select({ id: topics.id })
      .from(topics)
      .where(eq(topics.id, topicId))
      .limit(1);

    return result.length > 0;
  }
}
