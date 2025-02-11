import { Injectable } from '@nestjs/common';
import { DrizzleService } from '../db/drizzle.service';
import {
  forumPublications,
  publicationsComments,
  publicationsReactions,
  topics,
  users,
} from '../db/schemas/schema';
import { CreateForumPublicationDto } from './dtos/create-forumPublication.dto';
import { and, desc, eq, isNull, SQL, sql } from 'drizzle-orm';

@Injectable()
export class ForumRepository {
  constructor(private readonly drizzleService: DrizzleService) {}

  async createPublication(
    createDto: CreateForumPublicationDto,
    userId: string,
  ) {
    const publication = await this.drizzleService.db
      .insert(forumPublications)
      .values({
        headline: createDto.headline,
        content: createDto.content,
        mainTopicId: createDto.mainTopicId,
        authorId: userId,
        section: createDto.section,
      })
      .returning();

    return publication[0];
  }

  async findTopicById(topicId: number) {
    return this.drizzleService.db.query.topics.findFirst({
      where: (topics, { eq }) => eq(topics.id, topicId),
    });
  }

  async getForumPublications(
    filter?: {
      section?: SQL<'doubt' | 'need' | 'dream'>;
      mainTopicId?: number;
    },
    pagination?: { limit: number; page: number },
  ) {
    const baseQuery = this.drizzleService.db
      .select({
        id: forumPublications.id,
        headline: forumPublications.headline,
        content: forumPublications.content,
        section: forumPublications.section,
        mediaUrl: forumPublications.mediaUrl,
        createdAt: forumPublications.createdAt,
        author: {
          id: users.id,
          fullName: users.fullName,
          avatar: users.avatar,
          username: users.username,
        },
        mainTopic: {
          id: topics.id,
          name: topics.name,
        },
        commentCount: sql<number>`count(distinct ${publicationsComments.id})`,
        likeCount: sql<number>`sum(case when ${publicationsReactions.reactionType} = 'like' then 1 else 0 end)`,
        unlikeCount: sql<number>`sum(case when ${publicationsReactions.reactionType} = 'dislike' then 1 else 0 end)`,
      })
      .from(forumPublications)
      .leftJoin(
        publicationsComments,
        eq(forumPublications.id, publicationsComments.publicationId),
      )
      .leftJoin(
        publicationsReactions,
        and(
          eq(forumPublications.id, publicationsReactions.reactionableId),
          eq(publicationsReactions.reactionableType, 'forum_publication'),
        ),
      )
      .leftJoin(users, eq(forumPublications.authorId, users.id))
      .leftJoin(topics, eq(forumPublications.mainTopicId, topics.id))
      .where(
        filter
          ? and(
              filter.section
                ? eq(forumPublications.section, filter.section)
                : undefined,
              filter.mainTopicId
                ? eq(forumPublications.mainTopicId, filter.mainTopicId)
                : undefined,
            )
          : eq(forumPublications.status, 'published'),
      )
      .groupBy(forumPublications.id, users.id, topics.id)
      .orderBy(desc(forumPublications.createdAt))
      .limit(pagination?.limit || 10)
      .offset(
        (pagination?.page ? pagination.page - 1 : 0) *
          (pagination?.limit || 10),
      );

    const results = await baseQuery;

    return results.map((row) => ({
      ...row,
      commentCount: Number(row.commentCount),
      likeCount: Number(row.likeCount),
      unlikeCount: Number(row.unlikeCount),
    }));
  }
}
