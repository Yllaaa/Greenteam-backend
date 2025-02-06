import { NewsService } from './services/news.service';
import { Module } from '@nestjs/common';
import { NewsController } from './news.controller';
import { PublicNewsService } from './services/publicnews.service';
import { HttpModule } from '@nestjs/axios';
import { BloggerService } from './services/blogger.service';
import { NewsRepository } from './news.repository';
import { FetchNewsService } from './services/fetchnews.service';
import { BlogsModule } from './blogs/blogs.module';

@Module({
    imports: [HttpModule, BlogsModule],
    controllers: [NewsController],
    providers: [NewsRepository, NewsService, PublicNewsService, BloggerService, FetchNewsService],
})
export class NewsModule { }
