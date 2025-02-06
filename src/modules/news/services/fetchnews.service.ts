import { Injectable } from '@nestjs/common';
import { NewsService } from './news.service';
import { PublicNewsService } from './publicnews.service';
import { BloggerService } from './blogger.service';
import { Cron, Timeout } from '@nestjs/schedule';
import { BlogsService } from '../blogs/blogs.service';
import { NewsPostDto } from '../dto/news-post.dto';
import { validate } from 'class-validator';
import { BlogInterface } from '../blogs/interfaces/blog.interface';

@Injectable()
export class FetchNewsService {
    constructor(
        private readonly newsService: NewsService,
        private readonly publicNewsService: PublicNewsService,
        private readonly bloggerService: BloggerService,
        private readonly blogsService: BlogsService
    ) { }

    @Cron('0 39 1 * * *')
    async fetchNews() {
        // Fetch news from public sources and blogs
        const news = await this.fetchPublicNews();
        // Fetch news from blogs
        const blogs = await this.blogsService.getBlogs();
        for (const blog of blogs) {
            news.push(...await this.fetchBlogPosts(blog));
        }
        // Filter new that are later than a day and have no validation errors
        const date = new Date();
        date.setDate(date.getDate() - 1);
        news.filter(async (news) => news.published_at >= date && (await validate(news)).length == 0);
        // Add news to the database
        await this.newsService.addNews(news);
        // Delete outdated news
        await this.newsService.deleteOudatedNews();
    }

    private async fetchPublicNews(): Promise<NewsPostDto[]> {
        const date = new Date();
        date.setDate(date.getDate() - 1);
        const news = await this.publicNewsService.fetchNews("sustainability", date);
        return news.articles.map((news) => {
            const newsPost = new NewsPostDto();
            newsPost.title = news.title;
            newsPost.content = news.description;
            newsPost.published_at = new Date(news.publishedAt);
            newsPost.url = news.url;
            newsPost.image = news.urlToImage;
            return newsPost;
        });
    }

    private async fetchBlogPosts(blog: BlogInterface): Promise<NewsPostDto[]> {
        if (blog.type == "BLOGGER") {
            await this.fetchBlogPosts(blog);
        }
        return [];
    }


    private async fetchBloggerPosts(blog: BlogInterface): Promise<NewsPostDto[]> {
        const blogInfo = await this.bloggerService.fetchPlog(blog.url);
        const posts = await this.bloggerService.fetchPost(blogInfo.id);
        return posts.items.map((post) => {
            const newsPost = new NewsPostDto();
            newsPost.title = post.title;
            newsPost.content = post.content;
            newsPost.published_at = new Date(post.published);
            newsPost.url = post.url;
            newsPost.image = post.author.image.url;
            newsPost.blog_id = blog.id;
            return newsPost;
        });
    }

}
