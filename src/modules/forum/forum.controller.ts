import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ForumService } from './forum.service';
import { CreateForumPublicationDto } from './dtos/create-forumPublication.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
@Controller('forum')
export class ForumController {
  constructor(private readonly forumService: ForumService) {}

  @UseGuards(JwtAuthGuard)
  @Post('add-publication')
  async createForumPublication(
    @Body() dto: CreateForumPublicationDto,
    @Req() req,
  ) {
    const userId = req.user.id;
    return this.forumService.createPublication(dto, userId);
  }
}
