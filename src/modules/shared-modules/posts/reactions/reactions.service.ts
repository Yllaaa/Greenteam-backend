import { BadRequestException, Injectable } from '@nestjs/common';
import { ReactionsRepository } from '../../reactions/reactions.repository';
import {
  CreateReactionDto,
  ReactionableTypeEnum,
} from './dtos/create-reaction.dto';
import { ChallengesService } from 'src/modules/challenges/challenges.service';
import { QueuesService } from 'src/modules/common/queues/queues.service';
import { PostsService } from '../posts/posts.service';
import { Action } from 'src/modules/pointing-system/pointing-system.repository';
import { PointingSystemService } from 'src/modules/pointing-system/pointing-system.service';
@Injectable()
export class ReactionsService {
  private readonly allowedReactions = {
    post: ['like', 'dislike', 'do'],
    comment: ['like', 'dislike'],
    reply: ['like', 'dislike'],
  };

  constructor(
    private readonly reactionsRepository: ReactionsRepository,
    private readonly challengesService: ChallengesService,
    private readonly queuesService: QueuesService,
    private readonly postsService: PostsService,
    private readonly pointingSystemService: PointingSystemService,
  ) {}

  async toggleReaction(userId: string, dto: CreateReactionDto) {
    const topicId =
      dto.reactionableType === ReactionableTypeEnum.POST
        ? (await this.postsService.getPostById(dto.reactionableId)).mainTopicId
        : undefined;
    if (!this.isReactionValid(dto.reactionableType, dto.reactionType)) {
      throw new BadRequestException(
        `Invalid reaction type "${dto.reactionType}" for ${dto.reactionableType}.`,
      );
    }

    return dto.reactionType === 'do'
      ? this.handleDoReaction(userId, dto, topicId)
      : this.handleStandardReaction(userId, dto, topicId);
  }

  private async handleDoReaction(
    userId: string,
    dto: CreateReactionDto,
    topicId?: number,
  ) {
    const existingDoReaction =
      await this.reactionsRepository.findUserDoReaction(
        userId,
        dto.reactionableId,
        ReactionableTypeEnum.POST,
      );

    if (existingDoReaction) {
      await Promise.all([
        this.reactionsRepository.removeReaction(
          userId,
          dto.reactionableType,
          dto.reactionableId,
        ),
        this.challengesService.deleteDoPostChallenge(
          userId,
          dto.reactionableId,
        ),
      ]);

      if (topicId) {
        const action: Action = { id: existingDoReaction.id, type: 'do' };
        this.queuesService.removePointsJob(userId, topicId, action);
      }

      return { action: 'removed' };
    }

    const [reaction] = await this.reactionsRepository.addReaction(userId, dto);

    await Promise.all([
      reaction,
      this.challengesService.createDoPostChallenge(userId, dto.reactionableId),
    ]);

    if (topicId) {
      const action: Action = { id: reaction.id, type: 'do' };
      this.queuesService.addPointsJob(userId, topicId, action);
    }

    return { action: 'added' };
  }

  private async handleStandardReaction(
    userId: string,
    dto: CreateReactionDto,
    topicId?: number,
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
        if (dto.reactionableType === ReactionableTypeEnum.POST && topicId) {
          const action: Action = {
            id: existingReaction.id,
            type: dto.reactionType,
          };
          this.pointingSystemService.removeAward(userId, topicId, action);
        }
        return { action: 'removed' };
      } else {
        const [updated] = await this.reactionsRepository.updateReaction(
          userId,
          dto,
        );
        return { action: 'updated', type: updated.reactionType };
      }
    }

    const [reaction] = await this.reactionsRepository.addReaction(userId, dto);
    if (dto.reactionableType == ReactionableTypeEnum.POST && topicId) {
      const action: Action = { id: reaction.id, type: dto.reactionType };
      await this.pointingSystemService.awardPoints(userId, topicId, action);
    }
    return { action: 'added' };
  }

  private isReactionValid(
    reactionableType: ReactionableTypeEnum,
    reactionType: string,
  ): boolean {
    return (
      this.allowedReactions[reactionableType]?.includes(reactionType) ?? false
    );
  }
}
