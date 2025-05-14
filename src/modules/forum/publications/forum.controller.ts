import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  Param,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  Delete,
} from '@nestjs/common';
import { ForumService } from './forum.service';
import {
  CreateForumPublicationDto,
  ForumSection,
} from './dtos/create-forumPublication.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { GetForumPublicationsDto } from './dtos/get-publication.dto';
import { SQL } from 'drizzle-orm';
import { ValidateMediaInterceptor } from 'src/modules/common/upload-media/interceptors/validateMedia.interceptor';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { I18nService } from 'nestjs-i18n';

@UseGuards(JwtAuthGuard)
@Controller('')
export class ForumController {
  constructor(
    private readonly forumService: ForumService,
    private readonly i18n: I18nService
  ) { }

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

  @Delete('/:id')
  async deletePublication(@Param('id') id: string, @Req() req) {
    const userId = req.user.id;
    await this.forumService.deletePublication(id, userId);

    const translatedMessage = await this.i18n.t('forum.publications.notifications.PUBLICATION_DELETED');
    return { message: translatedMessage };
  }
}
