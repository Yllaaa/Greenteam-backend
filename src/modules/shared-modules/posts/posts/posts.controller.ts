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
import { CreateCommentDto } from '../comments/dtos/create-comment.dto';
import { CommentsService } from '../comments/comments.service';
@Controller()
@UseGuards(JwtAuthGuard)
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly commentsService: CommentsService,
  ) {}

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
