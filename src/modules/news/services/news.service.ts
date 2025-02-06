import { Injectable } from '@nestjs/common';
import { NewsRepository } from '../news.repository';

@Injectable()
export class NewsService {
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
        date.setMonth(date.getMonth() - 1);
        return this.newsRepository.deleteOudatedNews(date);
    }
}
