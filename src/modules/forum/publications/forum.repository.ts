import { Injectable } from '@nestjs/common';
import { DrizzleService } from '../../db/drizzle.service';
import {
  forumPublications,
  publicationsComments,
  publicationsReactions,
  topics,
  users,
} from '../../db/schemas/schema';
import {
  CreateForumPublicationDto,
  ForumSection,
} from './dtos/create-forumPublication.dto';
import { and, desc, eq, isNull, or, SQL, sql } from 'drizzle-orm';

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

  async findPublicationById(publicationId: string) {
    return this.drizzleService.db.query.forumPublications.findFirst({
      where: eq(forumPublications.id, publicationId),
    });
  }

  async findTopicById(topicId: number) {
    return this.drizzleService.db.query.topics.findFirst({
      where: (topics, { eq }) => eq(topics.id, topicId),
    });
  }

  async getForumPublications(
    filter: {
      section: SQL<'doubt' | 'dream' | 'need'> | undefined;
      mainTopicId: number;
    },
    pagination?: { limit: number; page: number },
    currentUserId?: string,
  ) {
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 10;
    const offset = Math.max(0, (page - 1) * limit);

    const filters: SQL[] = [];
    if (filter?.section) {
      filters.push(eq(forumPublications.section, filter.section));
    }
    if (filter?.mainTopicId) {
      filters.push(eq(forumPublications.mainTopicId, filter.mainTopicId));
    }

    if (filters.length === 0) {
      filters.push(eq(forumPublications.status, 'published'));
    }
    const whereCondition =
      filters.length > 0
        ? or(...filters)
        : eq(forumPublications.status, 'published');

    const commentCountSubquery = this.drizzleService.db
      .select({
        publicationId: publicationsComments.publicationId,
        count: sql<number>`count(*)`.as('comment_count'),
      })
      .from(publicationsComments)
      .groupBy(publicationsComments.publicationId)
      .as('comment_counts');

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
        commentCount: sql<number>`COALESCE(${commentCountSubquery.count}, 0)`,
        ...(filter?.section ==
        ('need' as unknown as SQL<'need' | 'doubt' | 'dream'>)
          ? {
              signCount: sql<number>`
            COUNT(CASE 
              WHEN ${publicationsReactions.reactionType} = 'sign' 
              THEN 1 
            END)`.as('sign_count'),
              dislikeCount: sql<number>`
            COUNT(CASE 
              WHEN ${publicationsReactions.reactionType} = 'dislike' 
              THEN 1 
            END)`.as('dislike_count'),
            }
          : {
              likeCount: sql<number>`
            COUNT(CASE 
              WHEN ${publicationsReactions.reactionType} = 'like' 
              THEN 1 
            END)`.as('like_count'),
              dislikeCount: sql<number>`
            COUNT(CASE 
              WHEN ${publicationsReactions.reactionType} = 'dislike' 
              THEN 1 
            END)`.as('dislike_count'),
            }),
        // User reaction status
        userReaction: sql<string | null>`
          CASE 
            WHEN ${publicationsReactions.userId} = ${currentUserId}
            THEN ${publicationsReactions.reactionType}
            ELSE NULL 
          END`.as('user_reaction'),
      })
      .from(forumPublications)
      .leftJoin(users, eq(forumPublications.authorId, users.id))
      .leftJoin(
        commentCountSubquery,
        eq(forumPublications.id, commentCountSubquery.publicationId),
      )
      .leftJoin(
        publicationsReactions,
        and(
          eq(forumPublications.id, publicationsReactions.reactionableId),
          eq(publicationsReactions.reactionableType, 'forum_publication'),
          filter?.section ==
            ('need' as unknown as SQL<'need' | 'doubt' | 'dream'>)
            ? or(
                eq(publicationsReactions.reactionType, 'dislike'),
                eq(publicationsReactions.reactionType, 'sign'),
              )
            : or(
                eq(publicationsReactions.reactionType, 'like'),
                eq(publicationsReactions.reactionType, 'dislike'),
              ),
        ),
      )
      .where(whereCondition)
      .groupBy(
        forumPublications.id,
        users.id,
        commentCountSubquery.count,
        publicationsReactions.userId,
        publicationsReactions.reactionType,
      )
      .orderBy(desc(forumPublications.createdAt))
      .limit(limit)
      .offset(offset);

    const results = await baseQuery;

    return results.map((row) => ({
      ...row,
      commentCount: Number(row.commentCount),
      ...(filter?.section ===
      ('need' as unknown as SQL<'need' | 'doubt' | 'dream'>)
        ? {
            signCount: 'signCount' in row ? Number(row.signCount || 0) : 0,
            dislikeCount: Number(row.dislikeCount || 0),
          }
        : {
            likeCount: 'likeCount' in row ? Number(row.likeCount || 0) : 0,
            dislikeCount: Number(row.dislikeCount || 0),
          }),
      userReaction: row.userReaction || null,
    }));
  }
}
