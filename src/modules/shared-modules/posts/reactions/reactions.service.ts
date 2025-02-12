import { BadRequestException, Injectable } from '@nestjs/common';
import { ReactionsRepository } from './reactions.repository';
import { CreateReactionDto } from './dtos/create-reaction.dto';

interface ToggleResponse {
  action: 'removed' | 'updated' | 'added';
  type?: string;
}

@Injectable()
export class ReactionsService {
  private readonly allowedReactions = {
    post: ['like', 'dislike', 'do'],
    comment: ['like', 'dislike'],
    reply: ['like', 'dislike'],
  };

  constructor(private readonly reactionsRepository: ReactionsRepository) {}

  async toggleReaction(userId: string, dto: CreateReactionDto) {
    try {
      const allowedReactions = this.allowedReactions[dto.reactionableType];
      if (!allowedReactions?.includes(dto.reactionType)) {
        throw new BadRequestException(
          `Invalid reaction type "${dto.reactionType}" for ${dto.reactionableType}. Allowed types: ${allowedReactions.join(', ')}`,
        );
      }

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

      const added = await this.reactionsRepository.addReaction(userId, dto);
      return { action: 'added' };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to toggle reaction');
    }
  }
}
