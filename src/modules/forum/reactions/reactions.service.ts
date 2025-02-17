import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateReactionDto } from 'src/modules/shared-modules/posts/reactions/dtos/create-reaction.dto';
import { ReactionsRepository } from 'src/modules/shared-modules/reactions/reactions.repository';
import { ForumService } from '../publications/forum.service';

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
  ) {}

  async toggleReaction(userId: string, dto: CreateReactionDto) {
    if (!this.isReactionValid(dto.reactionableType, dto.reactionType)) {
      throw new BadRequestException(
        `Invalid reaction type "${dto.reactionType}" for ${dto.reactionableType}.`,
      );
    }

    if (dto.reactionableType === 'forum_publication') {
      await this.validateForumPublicationReaction(dto);
    }

    return this.processReaction(userId, dto);
  }

  private async validateForumPublicationReaction(dto: CreateReactionDto) {
    const publication = await this.forumService.getPublication(
      dto.reactionableId,
    );
    if (!publication) {
      throw new NotFoundException('Publication not found');
    }

    if (!this.isValidForumReaction(publication.section, dto.reactionType)) {
      throw new BadRequestException(
        `Invalid reaction type "${dto.reactionType}" for forum section: ${publication.section}.`,
      );
    }
  }

  private async processReaction(userId: string, dto: CreateReactionDto) {
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
      }
      const [updated] = await this.reactionsRepository.updateReaction(
        userId,
        dto,
      );
      return { action: 'updated', type: updated.reactionType };
    }

    await this.reactionsRepository.addReaction(userId, dto);
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
