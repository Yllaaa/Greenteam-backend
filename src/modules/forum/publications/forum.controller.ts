import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ForumService } from './forum.service';
import {
  CreateForumPublicationDto,
  ForumSection,
} from './dtos/create-forumPublication.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { GetForumPublicationsDto } from './dtos/get-publication.dto';

@UseGuards(JwtAuthGuard)
@Controller('forum')
export class ForumController {
  constructor(private readonly forumService: ForumService) {}

  @Post('add-publication')
  async createForumPublication(
    @Body() dto: CreateForumPublicationDto,
    @Req() req,
  ) {
    const userId = req.user.id;
    return this.forumService.createPublication(dto, userId);
  }

  @Get()
  async getForumPublications(@Query() query: GetForumPublicationsDto) {
    return this.forumService.getPublications(
      {
        section: query?.section ?? ForumSection.DREAM,
        mainTopicId: query?.mainTopicId ?? 1,
      },
      { limit: query.limit ?? 10, page: query.page ?? 1 },
    );
  }
}
