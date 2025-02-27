import { Injectable } from '@nestjs/common';
import { DrizzleService } from '../db/drizzle.service';
import { usersDoPosts, usersGreenChallenges } from '../db/schemas/schema';
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

  async deleteDoPostChallenge(userId: string, postId: string) {
    return await this.drizzleService.db
      .delete(usersDoPosts)
      .where(
        and(eq(usersDoPosts.userId, userId), eq(usersDoPosts.postId, postId)),
      );
  }

  async getGreenChallenges(pagination: { page: number; limit: number }) {
    const { page = 1, limit = 10 } = pagination;
    const offset = Math.max(0, (page - 1) * limit);
    const now = new Date();
    return await this.drizzleService.db.query.greenChallenges.findMany({
      columns: {
        id: true,
        title: true,
        description: true,
        expiresAt: true,
      },
      where: (challenges, { gt }) => gt(challenges.expiresAt, now),
      orderBy: (challenges, { desc }) => [desc(challenges.createdAt)],
      with: {
        topic: {
          columns: {
            id: true,
            name: true,
          },
        },
      },
      limit,
      offset,
    });
  }

  async findGreenChallengeById(challengeId: string) {
    return this.drizzleService.db.query.greenChallenges.findFirst({
      where: eq(usersGreenChallenges.id, challengeId),
      columns: {
        id: true,
        title: true,
        description: true,
        expiresAt: true,
      },
    });
  }
  async findUserGreenChallenge(userId: string, challengeId: string) {
    return this.drizzleService.db.query.usersGreenChallenges.findFirst({
      where: and(
        eq(usersGreenChallenges.userId, userId),
        eq(usersGreenChallenges.challengeId, challengeId),
      ),
      columns: {
        id: true,
        userId: true,
        challengeId: true,
      },
    });
  }

  async addGreenChallengeToUser(userId: string, challengeId: string) {
    return await this.drizzleService.db.insert(usersGreenChallenges).values({
      userId,
      challengeId,
    });
  }
}
