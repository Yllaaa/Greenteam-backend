import { Injectable } from '@nestjs/common';
import { DrizzleService } from '../db/drizzle.service';
import { ActionType, pointsHistory, userPoints } from '../db/schemas/schema';
import { SQL, sql } from 'drizzle-orm';

export type Action = {
  id: string;
  type: ActionType;
};

const POINTS_MAP: Record<ActionType, number> = {
  post: 10,
  comment: 3,
  like: 1,
  dislike: 1,
  challenge: 10,
  forum_publication: 5,
};

@Injectable()
export class PointingSystemRepository {
  constructor(private readonly drizzleService: DrizzleService) {}

  private getPointsForAction(action: ActionType): number {
    return POINTS_MAP[action] ?? 0;
  }

  async awardPoints(userId: string, topicId: number, action: Action) {
    const points = this.getPointsForAction(action.type);

    await this.drizzleService.db.transaction(async (tx) => {
      await tx.insert(pointsHistory).values({
        userId,
        topicId,
        points,
        action: action.type,
        actionId: action.id,
      });

      await tx
        .insert(userPoints)
        .values({ userId, topicId, points })
        .onConflictDoUpdate({
          target: [userPoints.userId, userPoints.topicId],
          set: {
            points: sql`${userPoints.points} + ${sql.placeholder('points')}`,
          },
        })
        .execute({ points });
    });
  }

  async removeAward(userId: string, topicId: number, action: Action) {
    const points = this.getPointsForAction(action.type);

    await this.drizzleService.db.transaction(async (tx) => {
      await tx.insert(pointsHistory).values({
        userId,
        topicId,
        points: -points,
        action: action.type,
        actionId: action.id,
      });

      await tx
        .insert(userPoints)
        .values({ userId, topicId, points: -points })
        .onConflictDoUpdate({
          target: [userPoints.userId, userPoints.topicId],
          set: {
            points: sql`${userPoints.points} - ${sql.placeholder('points')}`,
          },
        })
        .execute({ points });
    });
  }
}
