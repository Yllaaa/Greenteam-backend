import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  CreateReactionDto,
  ReactionableTypeEnum,
} from 'src/modules/shared-modules/posts/reactions/dtos/create-reaction.dto';
import { ReactionsRepository } from 'src/modules/shared-modules/reactions/reactions.repository';
import { ForumService } from '../publications/forum.service';
import { QueuesService } from 'src/modules/common/queues/queues.service';
import { Action } from 'src/modules/pointing-system/pointing-system.repository';

@Injectable()
export class ReactionsService {
  private readonly allowedReactions = {
    forum_publication: {
      doubt: ['like', 'dislike'],
      dream: ['like', 'dislike'],
      need: ['sign', 'dislike'],
    },
    post: ['like', 'dislike', 'do'],
    comment: ['like', 'dislike'],
    reply: ['like', 'dislike'],
  };

  constructor(
    private readonly reactionsRepository: ReactionsRepository,
    private readonly forumService: ForumService,
    private readonly queuesService: QueuesService,
  ) {}

  async toggleReaction(userId: string, dto: CreateReactionDto) {
    if (!this.isReactionValid(dto.reactionableType, dto.reactionType)) {
      throw new BadRequestException(
        `Invalid reaction type "${dto.reactionType}" for ${dto.reactionableType}.`,
      );
    }

    let topicId: number | null = null;
    let publication: {
      id: string;
      status: 'draft' | 'published' | 'hidden' | null;
      createdAt: Date;
      content: string;
      mainTopicId: number;
      mediaUrl: string | null;
      headline: string;
      authorId: string;
      section: 'doubt' | 'dream' | 'need';
    } | null = null;

    const isForumPublication =
      dto.reactionableType === ReactionableTypeEnum.FORUM_PUBLICATION;

    if (isForumPublication) {
      publication = await this.forumService.getPublication(dto.reactionableId);
      if (!publication) {
        throw new NotFoundException('Publication not found');
      }

      if (!this.isValidForumReaction(publication.section, dto.reactionType)) {
        throw new BadRequestException(
          `Invalid reaction type "${dto.reactionType}" for forum section: ${publication.section}.`,
        );
      }

      topicId = publication.mainTopicId;
    }

    return this.processReaction(userId, dto, topicId, isForumPublication);
  }

  private async processReaction(
    userId: string,
    dto: CreateReactionDto,
    topicId: number | null,
    isForumPublication: boolean,
  ) {
    const existingReaction = await this.reactionsRepository.findUserReaction(
      userId,
      dto.reactionableType,
      dto.reactionableId,
    );

    if (existingReaction) {
      if (existingReaction.reactionType === dto.reactionType) {
        await this.reactionsRepository.removeReaction(
          userId,
          dto.reactionableType,
          dto.reactionableId,
        );
        const action: Action = {
          id: existingReaction.id,
          type: dto.reactionType,
        };
        if (isForumPublication && topicId) {
          this.queuesService.removePointsJob(userId, topicId, action);
        }

        return { action: 'removed' };
      }

      const [updated] = await this.reactionsRepository.updateReaction(
        userId,
        dto,
      );
      return { action: 'updated', type: updated.reactionType };
    }

    const [reaction] = await this.reactionsRepository.addReaction(userId, dto);
    const action: Action = { id: reaction.id, type: dto.reactionType };
    if (isForumPublication && topicId) {
      this.queuesService.addPointsJob(userId, topicId, action);
    }

    return { action: 'added' };
  }

  private isValidForumReaction(section: string, reactionType: string): boolean {
    return (
      this.allowedReactions.forum_publication[section]?.includes(
        reactionType,
      ) ?? false
    );
  }

  private isReactionValid(
    reactionableType: string,
    reactionType: string,
  ): boolean {
    if (reactionableType === 'forum_publication') return true;
    return (
      this.allowedReactions[reactionableType]?.includes(reactionType) ?? false
    );
  }
}
