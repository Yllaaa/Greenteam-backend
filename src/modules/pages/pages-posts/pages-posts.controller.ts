import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Get,
  Query,
  Param,
  BadRequestException,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { PagesPostsService } from './pages-posts.service';
import { GetPostsDto } from 'src/modules/shared-modules/posts/posts/dto/get-posts.dto';
import { CreatePostDto } from 'src/modules/shared-modules/posts/posts/dto/create-post.dto';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { UploadMediaService } from 'src/modules/common/upload-media/upload-media.service';
import { ValidateMediaInterceptor } from 'src/modules/common/upload-media/ValidateMedia.Interceptor';
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

  @Get('/:postId')
  async getPostById(
    @Param('postId') postId: string,
    @Param('slug') slug: string,
    @Req() req,
  ) {
    const userId = req.user.id;
    return await this.pagesPostsService.getPostById(postId, slug, userId);
  }

  @Post('publish-post')
  @UseInterceptors(AnyFilesInterceptor(), ValidateMediaInterceptor)
  async createPost(
    @Param('slug') slug: string,
    @Body() dto: CreatePostDto,
    @UploadedFiles()
    files: {
      images?: Express.Multer.File[];
      audio?: Express.Multer.File[];
      document?: Express.Multer.File[];
    },
  ) {
    console.log('files', files);
    return await this.pagesPostsService.createPost(
      {
        dto,
        files,
      },
      slug,
    );
  }
}
