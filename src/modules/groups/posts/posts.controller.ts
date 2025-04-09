import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { GroupPostsService } from './posts.service';
import { CreatePostDto } from '../../shared-modules/posts/posts/dto/create-post.dto';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { PostsService } from '../../shared-modules/posts/posts/posts.service';
import { GetPostsDto } from '../../shared-modules/posts/posts/dto/get-posts.dto';
import { CreateGroupPostDto } from './dtos/create-post.dto';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { ValidateMediaInterceptor } from 'src/modules/common/upload-media/interceptors/validateMedia.interceptor';

@Controller('groups')
@UseGuards(JwtAuthGuard)
export class GroupPostsController {
  constructor(
    private readonly groupPostsService: GroupPostsService,
    private readonly postsService: PostsService,
  ) {}

  @UseInterceptors(AnyFilesInterceptor(), ValidateMediaInterceptor)
  @Post(':groupId/publish-post')
  async createGroupPost(
    @Body() dto: CreateGroupPostDto,
    @Req() req,
    @Param('groupId') groupId: string,
    @UploadedFiles()
    files: {
      images?: Express.Multer.File[];
      document?: Express.Multer.File[];
    },
  ) {
    const userId: string = req.user.id;

    return this.groupPostsService.createPost({ dto, files }, groupId, userId);
  }

  @Get(':groupId/posts')
  async getGroupPosts(
    @Param('groupId') groupId: string,
    @Query() getPostDto: GetPostsDto,
    @Req() req,
  ) {
    const userId: string = req.user.id;
    return this.groupPostsService.getGroupPosts(groupId, userId, getPostDto);
  }

  @Get(':groupId/posts/:postId')
  async getGroupPost(@Param('postId') postId: string, @Req() req) {
    const userId: string = req.user.id;
    return this.postsService.getPostInDetails(postId, userId);
  }
}
