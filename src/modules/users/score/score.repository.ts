import { Injectable } from '@nestjs/common';
import { sql, eq, and, desc } from 'drizzle-orm';
import { DrizzleService } from 'src/modules/db/drizzle.service';
import {
  forumPublications,
  posts,
  publicationsComments,
  publicationsReactions,
  topics,
  userPoints,
  users,
} from 'src/modules/db/schemas/schema';

@Injectable()
export class ScoreRepository {
  constructor(private readonly drizzleService: DrizzleService) {}

  async getMainTopicsScore(userId: string) {
    const result = await this.drizzleService.db.execute(sql`
      WITH RECURSIVE 
    topic_hierarchy AS (
        SELECT 
            id AS topic_id, 
            parent_id, 
            id AS root_id
        FROM topics
        
        UNION ALL
        
        SELECT 
            t.id AS topic_id, 
            t.parent_id, 
            th.root_id
        FROM topics t
        JOIN topic_hierarchy th ON t.parent_id = th.topic_id
    ),

        user_topic_points AS (
            SELECT 
                topic_id, 
                SUM(points) AS total_points
            FROM user_points
            WHERE user_id = ${userId}
            GROUP BY topic_id
        ),

        topic_scores AS (
            SELECT 
                th.root_id AS topic_id,
                SUM(COALESCE(utp.total_points, 0)) AS total_points
            FROM topic_hierarchy th
            LEFT JOIN user_topic_points utp ON th.topic_id = utp.topic_id
            GROUP BY th.root_id
        )

        SELECT 
            t.id AS "topicId",
            t.name AS "topicName",
            COALESCE(ts.total_points, 0) AS "totalPoints"
        FROM topics t
        JOIN topic_scores ts ON t.id = ts.topic_id
        WHERE t.parent_id IS NULL 
        ORDER BY ts.total_points DESC;

    `);

    return result.rows;
  }

  async getSubTopicsScore(userId: string, topicId: number) {
    const subQuery = this.drizzleService.db
      .select({
        topicId: userPoints.topicId,
        totalPoints: sql<number>`sum(${userPoints.points})`.as('total_points'),
      })
      .from(userPoints)
      .where(eq(userPoints.userId, userId))
      .groupBy(userPoints.topicId)
      .as('user_topic_points');

    return await this.drizzleService.db
      .select({
        topicId: topics.id,
        topicName: topics.name,
        totalPoints: sql<number>`coalesce(${subQuery.totalPoints}, 0)`.as(
          'total_points',
        ),
      })
      .from(topics)
      .leftJoin(subQuery, eq(topics.id, subQuery.topicId))
      .where(eq(topics.parentId, topicId))
      .orderBy(desc(subQuery.totalPoints));
  }

  async getUserStats(userId: string) {
    const userStats = await this.drizzleService.db.query.users.findFirst({
      columns: {},
      where: (users, { eq }) => eq(users.id, userId),
      extras: {
        postsCount: sql<number>`(
          select count(*) from (
            select id from ${posts} where ${posts.creatorId} = ${userId}
            union all
            select id from ${forumPublications} where ${forumPublications.authorId} = ${userId}
          ) as combined_posts
        )`.as('posts_count'),
        commentsCount: sql<number>`(
          select count(*) from ${publicationsComments} 
          where ${publicationsComments.userId} = ${userId}
        )`.as('comments_count'),
        reactionsCount: sql<number>`(
          select count(*) from ${publicationsReactions} 
          where ${publicationsReactions.userId} = ${userId}
        )`.as('reactions_count'),
      },
    });
    return userStats;
  }
}
