import { Injectable } from '@nestjs/common';
import { NewsRepository } from '../news.repository';

@Injectable()
export class NewsService {
    readonly deleteAfterDays: number = <number>(process.env.NEWS_DELETE_AFTER_DAYS || 3);

    constructor(
        private readonly newsRepository: NewsRepository
    ) { }

    async getNews() {
        return this.newsRepository.getNews();
    }

    async addNews(data: any) {
        return this.newsRepository.addNews(data);
    }

    async deleteOudatedNews() {
        const date = new Date();
        date.setDate(date.getDate() - this.deleteAfterDays);
        return this.newsRepository.deleteOudatedNews(date);
    }
}
