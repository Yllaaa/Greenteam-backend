import { Injectable } from '@nestjs/common';
import { DrizzleService } from '../db/drizzle.service';
import { desc, eq } from 'drizzle-orm';
import { cities } from '../db/schemas/schema';
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
        nameES: true,
        iso: true,
      },
      orderBy: (countries, { asc }) => [
        asc(countries[locale === 'en' ? 'nameEn' : 'nameES']),
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
}
