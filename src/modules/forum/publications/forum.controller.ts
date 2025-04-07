import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ForumService } from './forum.service';
import {
  CreateForumPublicationDto,
  ForumSection,
} from './dtos/create-forumPublication.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { GetForumPublicationsDto } from './dtos/get-publication.dto';
import { SQL } from 'drizzle-orm';
import { ValidateMediaInterceptor } from 'src/modules/common/upload-media/validateMedia.interceptor';
import { AnyFilesInterceptor } from '@nestjs/platform-express';

@UseGuards(JwtAuthGuard)
@Controller('')
export class ForumController {
  constructor(private readonly forumService: ForumService) {}

  @Post('add-publication')
  @UseInterceptors(AnyFilesInterceptor(), ValidateMediaInterceptor)
  async createForumPublication(
    @Body() dto: CreateForumPublicationDto,
    @Req() req,
    @UploadedFiles()
    files: {
      images?: Express.Multer.File[];
      audio?: Express.Multer.File[];
      document?: Express.Multer.File[];
    },
  ) {
    const userId = req.user.id;
    return this.forumService.createPublication({ dto, files }, userId);
  }

  @Get()
  async getForumPublications(
    @Query() query: GetForumPublicationsDto,
    @Req() req,
  ) {
    const userId = req.user.id;
    return this.forumService.getPublications(
      {
        section: query?.section ?? undefined,

        mainTopicId: query?.mainTopicId ?? 1,
      },
      { limit: query.limit ?? 10, page: query.page ?? 1 },
      userId,
    );
  }
}
