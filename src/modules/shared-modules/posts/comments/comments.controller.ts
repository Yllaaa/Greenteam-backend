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
import { CreateCommentDto } from '../../comments/dtos/create-comment.dto';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { PaginationDto } from '../../comments/dtos/pagination.dto';
import { CommentsService } from '../../comments/comments.service';
import { SQL } from 'drizzle-orm';
import { I18nService } from 'nestjs-i18n';


@UseGuards(JwtAuthGuard)
@Controller('')
export class CommentsController {
  constructor(
    private readonly commentsService: CommentsService,
  private readonly i18n: I18nService) {}
  private publicationType: SQL<'forum_publication' | 'post'> =
    'post' as unknown as SQL<'forum_publication' | 'post'>;

  @Post(':postId/comment')
  createComment(
    @Param('postId') postId: string,
    @Body() dto: CreateCommentDto,
    @Req() req,
  ) {
    const userId = req.user.id;
    const publicationType = this.publicationType;
    return this.commentsService.createComment(postId, userId, {
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
    return this.commentsService.getCommentsByPublicationId(
      postId,
      pagination,
      userId,
    );
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
    const translatedMessage = await this.i18n.t('shared-modules.comments.notifications.COMMENT_DELETED');
    return { message: translatedMessage };
  }

  @Delete(':postId/comments/:commentId/replies/:replyId')
  async deleteReply(@Param('replyId') replyId: string, @Req() req) {
    const userId = req.user.id;
    await this.commentsService.deleteReply(replyId, userId);
    const translatedMessage = await this.i18n.t('shared-modules.comments.notifications.REPLY_DELETED');
    return { message: translatedMessage };
  }
}
