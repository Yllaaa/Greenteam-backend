import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Get,
  Query,
  Param,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { PagesPostsService } from './pages-posts.service';
import { GetPostsDto } from 'src/modules/shared-modules/posts/posts/dto/get-posts.dto';
import { CreatePostDto } from 'src/modules/shared-modules/posts/posts/dto/create-post.dto';
@UseGuards(JwtAuthGuard)
@Controller('')
export class PagesPostsController {
  constructor(private readonly pagesPostsService: PagesPostsService) {}

  @Get('')
  async getPagePosts(
    @Query() dto: GetPostsDto,
    @Param('slug') slug: string,
    @Req() req,
  ) {
    const userId = req.user.id;
    return await this.pagesPostsService.getPagePosts(dto, slug, userId);
  }

  @Post('publish-post')
  async createPost(@Body() dto: CreatePostDto, @Param('slug') slug: string) {
    return await this.pagesPostsService.createPost(dto, slug);
  }
}
