import {
  Controller,
  Post,
  Body,
  Req,
  UseInterceptors,
  UploadedFiles,
  Query,
  Get,
  Param,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import {
  AnyFilesInterceptor,
  FileFieldsInterceptor,
  FilesInterceptor,
} from '@nestjs/platform-express';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { GetPostsDto } from './dto/get-posts.dto';
import { ValidateMediaInterceptor } from 'src/modules/common/upload-media/ValidateMedia.Interceptor';

@UseGuards(JwtAuthGuard)
@Controller('')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @UseInterceptors(AnyFilesInterceptor(), ValidateMediaInterceptor)
  @Post('publish-post')
  async createPost(
    @Body() createPostDto: CreatePostDto,
    @Req() req,
    @UploadedFiles()
    files: {
      images?: Express.Multer.File[];
      audio?: Express.Multer.File[];
      document?: Express.Multer.File[];
    },
  ) {
    const userId = req.user.id;
    return this.postsService.createPost({ createPostDto, files }, userId);
  }

  @Get()
  async getPosts(@Query() dto: GetPostsDto, @Req() req) {
    const userId = req.user.id;
    return this.postsService.getPosts(dto, userId);
  }

  @Get(':id')
  async getPost(@Param('id') id: string, @Req() req) {
    const userId = req.user.id;
    return this.postsService.getPostInDetails(id, userId);
  }
}
