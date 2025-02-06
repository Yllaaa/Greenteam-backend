import { Body, Controller, Delete, Post, Req, UseGuards } from '@nestjs/common';
import { BlogsService } from './blogs.service';
import { BlogDto } from './dto/blog.Dto';
import { AuthGuard } from '@nestjs/passport';

@Controller("blogs")
// @UseGuards(AuthGuard)
export class BlogsController {
    constructor(
        private readonly blogsService: BlogsService
    ) { }

    @Post()
    async addBlog(@Body() blog: BlogDto, @Req() req) {
        blog.user_id = req.user.id;
        return await this.blogsService.addBlog(blog);
    }

    @Delete()
    async deleteBlog(@Req() req) {
        return await this.blogsService.deleteBlog(req.user.id);
    }
}
