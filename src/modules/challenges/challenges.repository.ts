import { Injectable } from '@nestjs/common';
import { DrizzleService } from '../db/drizzle.service';
import { usersDoPosts } from '../db/schemas/schema';
import { and, eq } from 'drizzle-orm';
@Injectable()
export class ChallengesRepository {
  constructor(private readonly drizzleService: DrizzleService) {}

  async createDoPostChallenge(userId: string, postId: string) {
    return await this.drizzleService.db.insert(usersDoPosts).values({
      userId,
      postId,
    });
  }

  async deleteDoPostChallenge(userId: string, postId: string) {
    return await this.drizzleService.db
      .delete(usersDoPosts)
      .where(
        and(eq(usersDoPosts.userId, userId), eq(usersDoPosts.postId, postId)),
      );
  }

  async getUsersDoPosts(
    userId: string,
    pagination: { page: number; limit: number },
  ) {
    const { page = 1, limit = 10 } = pagination;
    const offset = Math.max(0, (page - 1) * limit);
    return await this.drizzleService.db.query.usersDoPosts.findMany({
      where: and(
        eq(usersDoPosts.userId, userId),
        eq(usersDoPosts.status, 'pending'),
      ),
      columns: {},
      with: {
        post: {
          columns: {
            id: true,
            content: true,
            createdAt: true,
          },
          with: {
            user_creator: {
              columns: {
                id: true,
                fullName: true,
                avatar: true,
                username: true,
              },
            },
          },
        },
      },
      limit,
      offset,
    });
  }
}
