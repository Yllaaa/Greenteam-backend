import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { GetPostsDto } from './dto/get-posts.dto';
@Controller()
@UseGuards(JwtAuthGuard)
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post('publish-post')
  async createPost(@Body() createPostDto: CreatePostDto, @Req() req) {
    const userId = req.user.id;
    return this.postsService.createPost(createPostDto, userId);
  }

  @Get()
  async getPosts(@Query() topic: GetPostsDto, @Req() req) {
    const userId = req.user.id;
    return this.postsService.getPosts(topic, userId);
  }
}
