import { Injectable } from '@nestjs/common';
import { or, and, eq, sql } from 'drizzle-orm';
import { DrizzleService } from 'src/modules/db/drizzle.service';
import { followers, users } from 'src/modules/db/schemas/schema';

@Injectable()
export class FollowersRepository {
  constructor(private readonly drizzleService: DrizzleService) {}

  async follow(followerId: string, followingId: string) {
    const [follower] = await this.drizzleService.db
      .insert(followers)
      .values({
        followerId,
        followingId,
      })
      .returning();

    return follower;
  }

  async unfollow(followerId: string, followingId: string): Promise<void> {
    await this.drizzleService.db
      .delete(followers)
      .where(
        and(
          eq(followers.followerId, followerId),
          eq(followers.followingId, followingId),
        ),
      );
  }

  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    const result = await this.drizzleService.db
      .select({ count: sql<number>`count(*)` })
      .from(followers)
      .where(
        and(
          eq(followers.followerId, followerId),
          eq(followers.followingId, followingId),
        ),
      );

    return result[0].count > 0;
  }

  async getFollowers(
    userId: string,
  ): Promise<{ follower: any; since: Date }[]> {
    const result = await this.drizzleService.db
      .select({
        follower: users,
        since: followers.since,
      })
      .from(followers)
      .where(eq(followers.followingId, userId))
      .innerJoin(users, eq(followers.followerId, users.id));

    return result;
  }

  async getFollowing(
    userId: string,
  ): Promise<{ following: any; since: Date }[]> {
    const result = await this.drizzleService.db
      .select({
        following: users,
        since: followers.since,
      })
      .from(followers)
      .where(eq(followers.followerId, userId))
      .innerJoin(users, eq(followers.followingId, users.id));

    return result;
  }

  async getFollowersCount(userId: string): Promise<number> {
    const result = await this.drizzleService.db
      .select({ count: sql<number>`count(*)` })
      .from(followers)
      .where(eq(followers.followingId, userId));

    return result[0].count;
  }

  async getFollowingCount(userId: string): Promise<number> {
    const result = await this.drizzleService.db
      .select({ count: sql<number>`count(*)` })
      .from(followers)
      .where(eq(followers.followerId, userId));

    return result[0].count;
  }
}
