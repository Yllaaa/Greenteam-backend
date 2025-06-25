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
  Delete,
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
import { ValidateMediaInterceptor } from 'src/modules/common/upload-media/interceptors/validateMedia.interceptor';
import { I18nService } from 'nestjs-i18n';

@UseGuards(JwtAuthGuard)
@Controller('')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly i18n: I18nService) { }

  @UseInterceptors(AnyFilesInterceptor(), ValidateMediaInterceptor)
  @Post('publish-post')
  async createPost(
    @Body() createPostDto: CreatePostDto,
    @Req() req,
    @UploadedFiles()
    files: {
      images?: Express.Multer.File[];
      document?: Express.Multer.File[];
    },
  ) {
    const userId = req.user.id;
    return this.postsService.createPost({ createPostDto, files }, userId);
  }

  @Get()
  async getPosts(@Query() dto: GetPostsDto, @Req() req) {
    const userId = req.user.id;
    const posts = await this.postsService.getPosts(dto, userId);

    return posts.map((post) => ({
      ...post,
      isAuthor: post.author?.id === userId,
    }));
  }

  @Get(':id')
  async getPost(@Param('id') id: string, @Req() req) {
    const userId = req.user.id;
    return this.postsService.getPostInDetails(id, userId);
  }

  @Delete(':id')
  async deletePost(@Param('id') id: string, @Req() req) {
    const userId = req.user.id;
    await this.postsService.deletePost(id, userId);
    const translatedMessage = await this.i18n.t('pages.posts.notifications.POST_DELETED');
    return { message: translatedMessage };
  }
}
