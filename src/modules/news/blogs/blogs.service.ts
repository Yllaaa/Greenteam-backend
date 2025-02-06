/*
https://docs.nestjs.com/providers#services
*/

import { Injectable } from '@nestjs/common';
import { BlogsRepository } from './blogs.repository';
import { BlogDto } from './dto/blog.Dto';

@Injectable()
export class BlogsService {
    constructor(
        private readonly blogsRepository: BlogsRepository
    ) { }

    async addBlog(blog: BlogDto) {
        const existingBlog = await this.blogsRepository.getUserBlog(blog.user_id);
        if (existingBlog) {
            throw new Error("User already has a blog");
        }
        return await this.blogsRepository.addBlog(blog);
    }

    async deleteBlog(id: string) {
        return await this.blogsRepository.delteBlog(id);
    }

    async getBlogs() {
        return await this.blogsRepository.getBlogs();
    }
}
