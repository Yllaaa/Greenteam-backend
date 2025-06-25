import { BadRequestException, Injectable } from '@nestjs/common';
import {
  CreateReactionDto,
  ReactionableTypeEnum,
} from 'src/modules/shared-modules/posts/reactions/dtos/create-reaction.dto';
import { ReactionsRepository } from 'src/modules/shared-modules/reactions/reactions.repository';
@Injectable()
export class ReactionsService {
  private readonly allowedReactions = {
    comment: ['like', 'dislike'],
    reply: ['like', 'dislike'],
  };

  constructor(private readonly reactionsRepository: ReactionsRepository) {}

  async toggleReaction(userId: string, dto: CreateReactionDto) {
    if (!this.isReactionValid(dto.reactionableType, dto.reactionType)) {
      throw new BadRequestException(
        `Invalid reaction type "${dto.reactionType}" for ${dto.reactionableType}.`,
      );
    }

    return this.handleStandardReaction(userId, dto);
  }

  private async handleStandardReaction(userId: string, dto: CreateReactionDto) {
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
        return { action: 'removed' };
      } else {
        const [updated] = await this.reactionsRepository.updateReaction(
          userId,
          dto,
        );
        return { action: 'updated', type: updated.reactionType };
      }
    }

    await this.reactionsRepository.addReaction(userId, dto);
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
