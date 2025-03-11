import { Injectable, NotFoundException } from '@nestjs/common';
import { SQL } from 'drizzle-orm';
import { Action } from 'src/modules/pointing-system/pointing-system.repository';
import { CommentsRepository } from 'src/modules/shared-modules/comments/repositories/comments.repository';
import { RepliesRepository } from 'src/modules/shared-modules/comments/repositories/replies.repository';
import { QueuesService } from 'src/modules/common/queues/queues.service';
import { PointingSystemService } from 'src/modules/pointing-system/pointing-system.service';

@Injectable()
export class CommentsService {
  constructor(
    private readonly commentsRepository: CommentsRepository,
    private readonly repliesRepository: RepliesRepository,
    private readonly queuesService: QueuesService,
    private readonly pointingSystemService: PointingSystemService,
  ) {}

  async createComment(
    publicationId: string,
    userId: string,
    commentDto: {
      content: string;
      publicationType: SQL<'forum_publication' | 'post' | 'event'>;
    },
  ): Promise<Comment> {
    let topicId: number;

    if (
      commentDto.publicationType ===
      ('forum_publication' as unknown as SQL<
        'forum_publication' | 'post' | 'event'
      >)
    ) {
      const publication =
        await this.commentsRepository.getForumPublicationById(publicationId);
      if (!publication) {
        throw new NotFoundException('Publication not found');
      }
      topicId = publication.mainTopicId;
    } else {
      const post = await this.commentsRepository.getPostById(publicationId);
      if (!post) {
        throw new NotFoundException('Post not found');
      }
      topicId = post.mainTopicId;
    }
    const newComment = await this.commentsRepository.createComment(
      { userId, content: commentDto.content, publicationId },
      commentDto.publicationType,
    );
    const comment = await this.commentsRepository.findById(
      newComment.id,
      commentDto.publicationType,
    );
    const action: Action = {
      id: newComment.id,
      type: 'comment',
    };
    this.queuesService.addPointsJob(userId, topicId, action);
    return comment as Comment;
  }

  async getCommentsByPublicationId(
    publicationId: string,
    pagination: { limit: number; page: number },
  ) {
    return this.commentsRepository.getCommentsByPublicationId(
      publicationId,
      pagination,
    );
  }

  async createCommentReply(commentId: string, userId: string, dto: any) {
    const comment = await this.commentsRepository.findById(
      commentId,
      dto.publicationType,
    );
    if (!comment) throw new NotFoundException('Comment not found');

    const newReply = await this.repliesRepository.createCommentReply({
      commentId,
      userId,
      content: dto.content,
    });
    const reply = await this.repliesRepository.findById(newReply.id);
    return reply;
  }

  async getCommentsByPostId(
    postId: string,
    pagination: { limit: number; page: number },
    currentUserId: string,
  ) {
    return this.commentsRepository.getCommentsByPublicationId(
      postId,
      pagination,
      currentUserId,
    );
  }

  async getRepliesByCommentId(
    commentId: string,
    pagination: { limit: number; page: number },
    userId,
  ) {
    return this.repliesRepository.getRepliesByCommentId(
      commentId,
      pagination,
      userId,
    );
  }

  async deleteComment(
    commentId: string,
    userId: string,
    publicationType: SQL<'forum_publication' | 'post'>,
  ) {
    const comment = await this.commentsRepository.findById(
      commentId,
      publicationType,
    );

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.author.id !== userId) {
      throw new NotFoundException('You are not allowed to delete this comment');
    }

    const deletedComment = await this.commentsRepository.deleteComment(
      commentId,
      userId,
    );

    const action: Action = {
      id: commentId,
      type: 'comment',
    };

    const topicId =
      comment.post?.mainTopicId || comment.forumPublication?.mainTopicId;

    if (topicId) {
      this.queuesService.removePointsJob(userId, topicId, action);
    }

    return deletedComment;
  }

  async deleteReply(id: string, userId: string) {
    const reply = await this.repliesRepository.findById(id);
    if (!reply) {
      throw new NotFoundException('Reply not found');
    }

    if (reply.author.id !== userId) {
      throw new NotFoundException('You are not allowed to delete this reply');
    }

    return this.repliesRepository.deleteReply(id, userId);
  }
}
