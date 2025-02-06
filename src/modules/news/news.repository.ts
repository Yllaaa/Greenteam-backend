import { Injectable } from "@nestjs/common";
import { DrizzleService } from "../db/drizzle.service";
import { news } from '../db/schemas/news/news';
import { lt, sql } from "drizzle-orm";
import { date } from 'drizzle-orm/pg-core';
type NewsInsert = typeof news.$inferInsert;

@Injectable()
export class NewsRepository {
    constructor(
        private readonly drizzle: DrizzleService
    ) { }

    async getNews() {
        return this.drizzle.db.query.news.findMany();
    }

    async addNews(data: NewsInsert[]) {
        return this.drizzle.db.insert(news).values(data);
    }

    deleteOudatedNews(date: Date) {
        return this.drizzle.db.delete(news).where(sql`Date(${news.published_at}) < ${date.toLocaleDateString('en-CA')}`);
    }

}
