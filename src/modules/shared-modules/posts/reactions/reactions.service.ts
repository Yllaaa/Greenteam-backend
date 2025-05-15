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
import { NotificationQueueService } from 'src/modules/common/queues/notification-queue/notification-queue.service';
import { UsersService } from 'src/modules/users/users.service';
import { NotificationsService } from 'src/modules/notifications/notifications.service';
import { getNotificationMessage } from 'src/modules/notifications/notification-messages';
import { I18nService } from 'nestjs-i18n';
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
    private readonly usersService: UsersService,
    private readonly notificationQueueService: NotificationQueueService,
    private readonly notificationsService: NotificationsService,
    private readonly i18n: I18nService,
  ) {}

  async toggleReaction(userId: string, dto: CreateReactionDto) {
    const post =
      dto.reactionableType === ReactionableTypeEnum.POST
        ? await this.postsService.getPostById(dto.reactionableId)
        : undefined;
    const topicId = post?.mainTopicId;
    const postCreatorId = post?.creatorId;
    if (!this.isReactionValid(dto.reactionableType, dto.reactionType)) {
      throw new BadRequestException(
        this.i18n.translate(
          'shared-modules.reactions.errors.INVALID_REACTION_TYPE',
          {
            args: {
              reactionType: dto.reactionType,
              reactionableType: dto.reactionableType,
            },
          },
        ),
      );
    }

    return dto.reactionType === 'do'
      ? this.handleDoReaction(userId, dto, topicId)
      : this.handleStandardReaction(userId, dto, topicId, postCreatorId);
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
          existingDoReaction.id,
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
    postCreatorId?: string,
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
          existingReaction.id,
        );
        if (dto.reactionableType === ReactionableTypeEnum.POST && topicId) {
          const action: Action = {
            id: existingReaction.id,
            type: dto.reactionType,
          };
          this.queuesService.removePointsJob(userId, topicId, action);
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
      await this.queuesService.addPointsJob(userId, topicId, action);
    }

    if (
      postCreatorId &&
      postCreatorId !== userId &&
      dto.reactionableType === ReactionableTypeEnum.POST
    ) {
      const userInfo = await this.getUserInfo(userId);
      const userName = userInfo.name || 'Someone';

      const reactionMessages = getNotificationMessage('reaction', userName);

      await this.notificationQueueService.addCreateNotificationJob({
        recipientId: postCreatorId,
        actorId: userId,
        type: 'reaction',
        metadata: {
          postId: dto.reactionableId,
          reactionType: dto.reactionType,
        },
        messageEn: reactionMessages.en,
        messageEs: reactionMessages.es,
      });
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

  private async getUserInfo(userId: string) {
    const user = await this.usersService.getUserById(userId);
    if (!user) {
      throw new BadRequestException('users.profiles.errors.USER_NOT_FOUND');
    }
    return {
      id: user.id,
      name: user.fullName,
    };
  }
}
