import { Injectable } from '@nestjs/common';
import { DrizzleService } from '../db/drizzle.service';
import { ActionType, pointsHistory, userPoints } from '../db/schemas/schema';
import { SQL, sql } from 'drizzle-orm';

export type Action = {
  id: string;
  type: ActionType;
};

@Injectable()
export class PointingSystemRepository {
  constructor(private readonly drizzleService: DrizzleService) {}

  async awardPoints(
    userId: string,
    topicId: number,
    action: Action,
    points: number,
  ) {
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
        });
    });
  }
}
