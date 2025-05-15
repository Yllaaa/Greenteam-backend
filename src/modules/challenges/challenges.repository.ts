import { Injectable } from '@nestjs/common';
import { DrizzleService } from '../db/drizzle.service';
import {
  entitiesMedia,
  greenChallenges,
  MediaType,
  posts,
  topics,
  UserChallengeStatus,
  users,
  usersDoPosts,
  usersGreenChallenges,
} from '../db/schemas/schema';
import { and, desc, eq, inArray, or, SQL, sql } from 'drizzle-orm';
@Injectable()
export class ChallengesRepository {
  constructor(private readonly drizzleService: DrizzleService) {}

  async createDoPostChallenge(userId: string, postId: string) {
    return await this.drizzleService.db
      .insert(usersDoPosts)
      .values({
        userId,
        postId,
      })
      .returning();
  }
  async findDoPostChallenge(postId: string, userId: string) {
    return await this.drizzleService.db.query.usersDoPosts.findFirst({
      where: and(
        eq(usersDoPosts.postId, postId),
        eq(usersDoPosts.userId, userId),
      ),
    });
  }

  async UpdateDoPostChallengeStatus(
    postId: string,
    userId: string,
    status: UserChallengeStatus,
  ) {
    return await this.drizzleService.db
      .update(usersDoPosts)
      .set({ status })
      .where(
        and(eq(usersDoPosts.userId, userId), eq(usersDoPosts.postId, postId)),
      );
  }

  async getUsersDoPosts(
    userId: string,
    pagination: { page: number; limit: number },
    topicId?: number,
  ) {
    const { page = 1, limit = 10 } = pagination;
    const offset = Math.max(0, (page - 1) * limit);
    const conditions = [
      eq(usersDoPosts.userId, userId),
      eq(usersDoPosts.status, 'pending'),
    ];

    if (topicId) {
      conditions.push(eq(posts.mainTopicId, topicId));
    }
    return await this.drizzleService.db
      .select({
        createdAt: usersDoPosts.createdAt,
        post: {
          id: posts.id,
          content: posts.content,
          createdAt: posts.createdAt,
          mainTopicId: posts.mainTopicId,
        },
        creator: {
          id: users.id,
          name: users.fullName,
          avatar: users.avatar,
          username: users.username,
        },
        media: sql<
          Array<{
            id: string;
            mediaUrl: string;
            mediaType: MediaType;
          }>
        >`
              COALESCE(
                jsonb_agg(
                  DISTINCT jsonb_build_object(
                    'id', ${entitiesMedia.id},
                    'mediaUrl', ${entitiesMedia.mediaUrl},
                    'mediaType', ${entitiesMedia.mediaType}
                  )
                ) FILTER (WHERE ${entitiesMedia.id} IS NOT NULL),
                '[]'::jsonb
              )
              `.as('media'),
      })
      .from(usersDoPosts)
      .innerJoin(posts, eq(posts.id, usersDoPosts.postId))
      .innerJoin(users, eq(users.id, posts.creatorId))
      .leftJoin(entitiesMedia, eq(posts.id, entitiesMedia.parentId))
      .where(and(...conditions))
      .groupBy(usersDoPosts.id, posts.id, users.id, entitiesMedia.id)
      .orderBy(desc(usersDoPosts.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async deleteDoPostChallenge(userId: string, postId: string) {
    return await this.drizzleService.db
      .delete(usersDoPosts)
      .where(
        and(eq(usersDoPosts.userId, userId), eq(usersDoPosts.postId, postId)),
      );
  }

  async getGreenChallenges(
    pagination: { page: number; limit: number },
    userId: string,
  ) {
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
      where: (challenges, { and, gt, notExists }) =>
        and(
          gt(challenges.expiresAt, now),
          notExists(
            this.drizzleService.db.select().from(usersGreenChallenges)
              .where(sql`${usersGreenChallenges.challengeId} = ${challenges.id} 
                    AND ${usersGreenChallenges.userId} = ${userId}`),
          ),
        ),
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

  async getUserGreenChallengesToDoList(
    userId: string,
    pagination: { page: number; limit: number },
    topicId?: number,
  ) {
    const { page = 1, limit = 10 } = pagination;
    const offset = Math.max(0, (page - 1) * limit);

    const topicIds = topicId
      ? await this.drizzleService.db
          .select({ id: topics.id })
          .from(topics)
          .where(or(eq(topics.id, topicId), eq(topics.parentId, topicId)))
          .then((results) => results.map((topic) => topic.id))
      : undefined;

    return await this.drizzleService.db
      .select({
        userChallenge: {
          id: usersGreenChallenges.id,
          challengeId: usersGreenChallenges.challengeId,
          createdAt: usersGreenChallenges.createdAt,
          status: usersGreenChallenges.status,
        },
        challenge: {
          id: greenChallenges.id,
          title: greenChallenges.title,
          description: greenChallenges.description,
          expiresAt: greenChallenges.expiresAt,
        },
        topic: {
          id: topics.id,
          name: topics.name,
        },
      })
      .from(usersGreenChallenges)
      .innerJoin(
        greenChallenges,
        eq(greenChallenges.id, usersGreenChallenges.challengeId),
      )
      .innerJoin(topics, eq(topics.id, greenChallenges.topicId))
      .where(
        and(
          eq(usersGreenChallenges.userId, userId),
          eq(usersGreenChallenges.status, 'pending'),
          topicIds ? inArray(topics.id, topicIds) : undefined,
        ),
      )
      .orderBy(desc(usersGreenChallenges.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async findGreenChallengeById(challengeId: string) {
    return this.drizzleService.db.query.greenChallenges.findFirst({
      where: eq(usersGreenChallenges.id, challengeId),
      columns: {
        id: true,
        title: true,
        description: true,
        expiresAt: true,
        topicId: true,
      },
    });
  }
  async findUserGreenChallenge(
    userId: string,
    challengeId: string,
  ): Promise<UserGreenChallenge | null> {
    const userChallenge =
      await this.drizzleService.db.query.usersGreenChallenges.findFirst({
        where: and(
          eq(usersGreenChallenges.userId, userId),
          eq(usersGreenChallenges.challengeId, challengeId),
        ),
        columns: {
          id: true,
          userId: true,
          challengeId: true,
          status: true,
        },
        with: {
          challenge: {
            columns: {
              id: true,
              topicId: true,
            },
          },
        },
      });
    return userChallenge as UserGreenChallenge;
  }

  async addGreenChallengeToUser(
    userId: string,
    challengeId: string,
    status?: SQL<'pending' | 'done' | 'rejected'>,
  ) {
    return await this.drizzleService.db.insert(usersGreenChallenges).values({
      userId,
      challengeId,
      status: status || 'pending',
    });
  }
  async markGreenChallengeAsDone(userId: string, challengeId: string) {
    return await this.drizzleService.db
      .update(usersGreenChallenges)
      .set({ status: 'done' })
      .where(
        and(
          eq(usersGreenChallenges.userId, userId),
          eq(usersGreenChallenges.challengeId, challengeId),
        ),
      );
  }

  async getParentTopic(topicId: number) {
    return await this.drizzleService.db.query.topics.findFirst({
      where: eq(topics.parentId, topicId),
      columns: {
        id: true,
        name: true,
      },
    });
  }
}
