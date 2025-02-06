import { Body, Controller, Delete, Get, Param, Post, Put, Request } from '@nestjs/common';
import { NewsService } from './services/news.service';
import { NewsPostDto } from './dto/news-post.dto';
import { IdParamDto } from './dto/id_param.dto';

@Controller("news")
export class NewsController {

    constructor(
        private readonly newsService: NewsService
    ) { }

    @Get("published")
    async getPublishidNews() {
        return this.newsService.getPublishidNews();
    }

    @Post()
    async addNews(@Body() data: NewsPostDto, @Request() req) {
        return this.newsService.addNewsArticle(data, req.user);
    }

    @Get()
    async getNews() {
        return this.newsService.getNews();
    }

    @Put(":id/publish")
    async setNewsPublished(@Param() id: IdParamDto) {
        return this.newsService.setNewsPublished(id.id);
    }

    @Delete(":id")
    async deleteNewsArticle(@Param() id: IdParamDto) {
        return this.newsService.deleteNewsArticle(id.id);
    }
}
