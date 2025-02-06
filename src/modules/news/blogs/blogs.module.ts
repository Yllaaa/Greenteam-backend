import { Module } from '@nestjs/common';
import { DrizzleService } from 'src/modules/db/drizzle.service';
import { BlogsRepository } from './blogs.repository';
import { BlogsService } from './blogs.service';
import { BlogsController } from './blogs.controller';

@Module({
    imports: [],
    controllers: [BlogsController],
    providers: [BlogsRepository, BlogsService],
    exports: [BlogsService]
})
export class BlogsModule { }
