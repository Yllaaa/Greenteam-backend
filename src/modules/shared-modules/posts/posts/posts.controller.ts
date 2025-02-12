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
import { CreateCommentDto } from './dto/create-comment.dto';

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
  async getPosts(@Query() topic: GetPostsDto) {
    return this.postsService.getPosts(topic);
  }

  @Post(':postId/comment')
  createComment(
    @Param('postId') postId: string,
    @Body() dto: CreateCommentDto,
    @Req() req,
  ) {
    const userId = req.user.id;
    return this.postsService.createComment(postId, userId, dto);
  }

  @Post(':postId/comments/:commentId/reply')
  createReply(
    @Param('commentId') commentId: string,
    @Body() dto: CreateCommentDto,
    @Req() req,
  ) {
    const userId = req.user.id;
    return this.postsService.createCommentReply(commentId, userId, dto);
  }
}
