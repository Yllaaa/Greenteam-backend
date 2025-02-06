import { Injectable } from "@nestjs/common";
import { DrizzleService } from "../db/drizzle.service";
import { news } from '../db/schemas/news/news';
import { eq, lt, sql } from "drizzle-orm";
import { date } from 'drizzle-orm/pg-core';
type NewsInsert = typeof news.$inferInsert;

@Injectable()
export class NewsRepository {
    constructor(
        private readonly drizzle: DrizzleService
    ) { }

    async getNews() {
        return await this.drizzle.db.query.news.findMany();
    }

    async addNews(data: NewsInsert[]) {
        return await this.drizzle.db.insert(news).values(data);
    }

    async deleteOudatedNews(date: Date) {
        return await this.drizzle.db.delete(news).where(sql`Date(${news.published_at}) < ${date.toLocaleDateString('en-CA')}`);
    }

    async addNewsArticle(data: NewsInsert) {
        return await this.drizzle.db.insert(news).values(data);
    }

    async deleteNewsArticle(id: string) {
        return await this.drizzle.db.delete(news).where(eq(news.id, id));
    }

    async getPublishidNews() {
        return await this.drizzle.db.query.news.findMany({ where: eq(news.published, true) });
    }

    async updateNewsArticle(id: string, data: NewsInsert) {
        return await this.drizzle.db.update(news).set(data).where(eq(news.id, id));
    }
}
