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
  FileFieldsInterceptor,
  FilesInterceptor,
} from '@nestjs/platform-express';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { GetPostsDto } from './dto/get-posts.dto';
import { UploadMediaService } from 'src/modules/common/upload-media/upload-media.service';
import { ValidateMediaInterceptor } from 'src/modules/common/upload-media/ValidateMediaInterceptor';

@UseGuards(JwtAuthGuard)
@Controller('')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly uploadMediaService: UploadMediaService,
  ) {}

  @Post('publish-post')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'images', maxCount: 4 },
        { name: 'audio', maxCount: 1 },
        { name: 'document', maxCount: 1 },
      ],
      {
        storage: undefined,
        limits: {
          fileSize: 50 * 1024 * 1024,
        },
      },
    ),
  )
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
    try {
      const uploadedFiles = await this.uploadMediaService.uploadFilesToS3(
        files,
        'posts',
      );

      const userId = req.user.id;
      return this.postsService.createPost(
        { createPostDto, files: uploadedFiles },
        userId,
      );
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to upload media: ' + error.message);
    }
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
