import {
  Body,
  Controller,
  Delete,
  Get,
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

@UseGuards(JwtAuthGuard)
@Controller('')
export class EventCommentsController {
  constructor(private readonly commentsService: CommentsService) {}
  private publicationType: SQL<'forum_publication' | 'post' | 'event'> =
    'post' as unknown as SQL<'forum_publication' | 'post' | 'event'>;

  @Post(':eventId/comment')
  createComment(
    @Param('eventId') eventId: string,
    @Body() dto: CreateCommentDto,
    @Req() req,
  ) {
    const userId = req.user.id;
    const publicationType = this.publicationType;
    return this.commentsService.createComment(eventId, userId, {
      content: dto.content,
      publicationType,
    });
  }

  @Post(':postId/comments/:commentId/reply')
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

  @Get(':postId/comments')
  getComments(
    @Param('postId') postId: string,
    @Query() pagination: PaginationDto,
    @Req() req,
  ) {
    const userId = req.user.id;
    return this.commentsService.getCommentsByPostId(postId, pagination, userId);
  }

  @Get(':postId/comments/:commentId/replies')
  getReplies(
    @Param('commentId') commentId: string,
    @Query() pagination: PaginationDto,
    @Req() req,
  ) {
    const userId = req.user.id;
    return this.commentsService.getRepliesByCommentId(
      commentId,
      pagination,
      userId,
    );
  }

  @Delete(':postId/comments/:commentId')
  async deleteComment(@Param('commentId') commentId: string, @Req() req) {
    const userId = req.user.id;
    await this.commentsService.deleteComment(
      commentId,
      userId,
      this.publicationType,
    );
    return { message: 'Comment deleted successfully' };
  }

  @Delete(':postId/comments/:commentId/replies/:replyId')
  async deleteReply(@Param('replyId') replyId: string, @Req() req) {
    const userId = req.user.id;
    await this.commentsService.deleteReply(replyId, userId);
    return { message: 'Reply deleted successfully' };
  }
}
