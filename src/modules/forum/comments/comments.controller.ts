import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';

import { SQL } from 'drizzle-orm';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { CommentsService } from 'src/modules/shared-modules/comments/comments.service';
import { CreateCommentDto } from 'src/modules/shared-modules/comments/dtos/create-comment.dto';
import { PaginationDto } from 'src/modules/shared-modules/comments/dtos/pagination.dto';
import { ForumService } from '../publications/forum.service';

@UseGuards(JwtAuthGuard)
@Controller('')
export class CommentsController {
  constructor(
    private readonly commentsService: CommentsService,
    private readonly forumService: ForumService,
  ) {}

  private publicationType: SQL<'forum_publication' | 'post' | 'comment'> =
    'forum_publication' as unknown as SQL<
      'forum_publication' | 'post' | 'comment'
    >;
  @Post(':publicationId/comment')
  async createComment(
    @Param('publicationId') publicationId: string,
    @Body() dto: CreateCommentDto,
    @Req() req,
  ) {
    const userId = req.user.id;
    const publicationType = this.publicationType;

    const publication = await this.forumService.getPublication(publicationId);
    if (!publication) {
      throw new NotFoundException('Publication not found');
    }
    return this.commentsService.createComment(publicationId, userId, {
      content: dto.content,
      publicationType,
    });
  }

  @Post(':publicationId/comments/:commentId/reply')
  createReply(
    @Param('commentId') commentId: string,
    @Body() dto: CreateCommentDto,
    @Req() req,
  ) {
    const userId = req.user.id;
    return this.commentsService.createCommentReply(commentId, userId, {
      content: dto.content,
      publicationType: this.publicationType,
    });
  }

  @Get(':publicationId/comments')
  getComments(
    @Param('publicationId') publicationId: string,
    @Query() pagination: PaginationDto,
  ) {
    return this.commentsService.getCommentsByPostId(publicationId, pagination);
  }

  @Get(':publicationId/comments/:commentId/replies')
  getReplies(
    @Param('commentId') commentId: string,
    @Query() pagination: PaginationDto,
  ) {
    return this.commentsService.getRepliesByCommentId(commentId, pagination);
  }
}
