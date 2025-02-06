import { Injectable } from '@nestjs/common';
import { NewsRepository } from '../news.repository';
import { NewsPostDto } from '../dto/news-post.dto';

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

    async addNewsArticle(data: any, user: any) {
        const article = data as NewsPostDto;
        article.author = user.fullName;
        article.blog_id = undefined;
        article.published = false;
        return this.newsRepository.addNewsArticle(data);
    }

    async deleteNewsArticle(id: string) {
        return this.newsRepository.deleteNewsArticle(id);
    }

    async getPublishidNews() {
        return this.newsRepository.getPublishidNews();
    }

    async setNewsPublished(id: string) {
        return this.newsRepository.updateNewsArticle(id, { published: true });
    }
}
