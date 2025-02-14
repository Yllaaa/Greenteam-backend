import { BadRequestException, Injectable } from '@nestjs/common';
import { ReactionsRepository } from './reactions.repository';
import { CreateReactionDto } from './dtos/create-reaction.dto';
import { ChallengesService } from 'src/modules/challenges/challenges.service';

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
  ) {}

  async toggleReaction(userId: string, dto: CreateReactionDto) {
    if (!this.isReactionValid(dto.reactionableType, dto.reactionType)) {
      throw new BadRequestException(
        `Invalid reaction type "${dto.reactionType}" for ${dto.reactionableType}.`,
      );
    }

    return dto.reactionType === 'do'
      ? this.handleDoReaction(userId, dto)
      : this.handleStandardReaction(userId, dto);
  }

  private async handleDoReaction(userId: string, dto: CreateReactionDto) {
    const existingDoReaction =
      await this.reactionsRepository.findUserDoReaction(
        userId,
        dto.reactionableId,
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
      return { action: 'removed' };
    }

    await Promise.all([
      this.reactionsRepository.addReaction(userId, dto),
      this.challengesService.createDoPostChallenge(userId, dto.reactionableId),
    ]);

    return { action: 'added' };
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
    reactionableType: string,
    reactionType: string,
  ): boolean {
    return (
      this.allowedReactions[reactionableType]?.includes(reactionType) ?? false
    );
  }
}
