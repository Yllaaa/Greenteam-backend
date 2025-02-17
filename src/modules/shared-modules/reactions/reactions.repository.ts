import { Injectable } from '@nestjs/common';
import { eq, and, ne } from 'drizzle-orm';

import { DrizzleService } from 'src/modules/db/drizzle.service';
import { publicationsReactions } from 'src/modules/db/schemas/schema';
import {
  CreateReactionDto,
  ReactionableTypeEnum,
} from '../posts/reactions/dtos/create-reaction.dto';
@Injectable()
export class ReactionsRepository {
  constructor(private readonly drizzleService: DrizzleService) {}

  async addReaction(userId: string, dto: CreateReactionDto) {
    return this.drizzleService.db.insert(publicationsReactions).values({
      userId,
      reactionableType: dto.reactionableType,
      reactionableId: dto.reactionableId,
      reactionType: dto.reactionType,
    });
  }

  async findUserReaction(
    userId: string,
    reactionableType: ReactionableTypeEnum,
    reactionableId: string,
  ) {
    return this.drizzleService.db.query.publicationsReactions.findFirst({
      where: and(
        eq(publicationsReactions.userId, userId),
        eq(publicationsReactions.reactionableType, reactionableType),
        eq(publicationsReactions.reactionableId, reactionableId),
        ne(publicationsReactions.reactionType, 'do'),
      ),
    });
  }

  async findUserDoReaction(userId: string, postId: string) {
    return this.drizzleService.db.query.publicationsReactions.findFirst({
      where: and(
        eq(publicationsReactions.userId, userId),
        eq(publicationsReactions.reactionableType, 'post'),
        eq(publicationsReactions.reactionableId, postId),
        eq(publicationsReactions.reactionType, 'do'),
      ),
    });
  }

  async removeReaction(
    userId: string,
    reactionableType: ReactionableTypeEnum,
    reactionableId: string,
  ) {
    return this.drizzleService.db
      .delete(publicationsReactions)
      .where(
        and(
          eq(publicationsReactions.userId, userId),
          eq(publicationsReactions.reactionableType, reactionableType),
          eq(publicationsReactions.reactionableId, reactionableId),
        ),
      );
  }

  async updateReaction(userId: string, dto: CreateReactionDto) {
    return this.drizzleService.db
      .update(publicationsReactions)
      .set({ reactionType: dto.reactionType })
      .where(
        and(
          eq(publicationsReactions.userId, userId),
          eq(publicationsReactions.reactionableType, dto.reactionableType),
          eq(publicationsReactions.reactionableId, dto.reactionableId),
        ),
      )
      .returning({
        id: publicationsReactions.id,
        reactionType: publicationsReactions.reactionType,
      });
  }
}
