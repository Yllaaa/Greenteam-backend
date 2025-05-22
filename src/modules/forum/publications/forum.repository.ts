import { Injectable } from '@nestjs/common';
import { DrizzleService } from '../../db/drizzle.service';
import {
  cities,
  countries,
  entitiesMedia,
  forumPublications,
  MediaParentType,
  MediaType,
  publicationsComments,
  publicationsReactions,
  users,
  usersLocations,
} from '../../db/schemas/schema';
import { CreateForumPublicationDto } from './dtos/create-forumPublication.dto';
import { and, desc, eq, isNull, or, SQL, sql } from 'drizzle-orm';
import {
  BasePublication,
  BaseQueryResult,
  Publication,
} from './interfaces/publications.interface';
import { I18nContext } from 'nestjs-i18n';

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

  async insertPublicationMedia(
    media: {
      parentId: string;
      parentType: MediaParentType;
      mediaUrl: string;
      mediaType: MediaType;
    }[],
  ) {
    for (const item of media) {
      const { parentId, parentType, mediaUrl, mediaType } = item;
      const [mediaEntry] = await this.drizzleService.db
        .insert(entitiesMedia)
        .values({
          parentId,
          parentType,
          mediaUrl,
          mediaType,
        })
        .returning({
          id: entitiesMedia.id,
          mediaUrl: entitiesMedia.mediaUrl,
          mediaType: entitiesMedia.mediaType,
        });
    }
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
    const lang = I18nContext.current()?.lang || 'en';

    const baseFilters = [eq(forumPublications.status, 'published')];
    if (filter?.section) {
      baseFilters.push(eq(forumPublications.section, filter.section));
    }
    if (filter?.mainTopicId) {
      baseFilters.push(eq(forumPublications.mainTopicId, filter.mainTopicId));
    }

    const whereCondition = and(...baseFilters);
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
        createdAt: forumPublications.createdAt,
        author: {
          id: users.id,
          fullName: users.fullName,
          avatar: users.avatar,
          username: users.username,
        },
        location: {
          countryName: sql<string | null>`
          CASE 
            WHEN ${lang} = 'es' THEN ${countries.nameEs}
            ELSE ${countries.nameEn}
          END`,
          countryIso: countries.iso,
          cityName: sql<string | null>`
          CASE 
            WHEN ${lang} = 'es' THEN ${cities.nameEn}
            ELSE ${cities.nameEn}
          END`,
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
        commentCount: sql<number>`COALESCE(${commentCountSubquery.count}, 0)`,
        ...(sql`${forumPublications.section} = 'need'`
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
        userReaction: sql<string | null>`
        CASE 
          WHEN ${publicationsReactions.userId} = ${currentUserId}
          THEN ${publicationsReactions.reactionType}
          ELSE NULL 
        END`.as('user_reaction'),
      })
      .from(forumPublications)
      .leftJoin(users, eq(forumPublications.authorId, users.id))
      .leftJoin(usersLocations, eq(users.id, usersLocations.userId))
      .leftJoin(countries, eq(usersLocations.countryId, countries.id))
      .leftJoin(cities, eq(usersLocations.cityId, cities.id))
      .leftJoin(
        commentCountSubquery,
        eq(forumPublications.id, commentCountSubquery.publicationId),
      )
      .leftJoin(entitiesMedia, eq(forumPublications.id, entitiesMedia.parentId))
      .leftJoin(
        publicationsReactions,
        and(
          eq(forumPublications.id, publicationsReactions.reactionableId),
          eq(publicationsReactions.reactionableType, 'forum_publication'),
          sql`${forumPublications.section} = 'need'`
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
        users.fullName,
        users.avatar,
        users.username,
        countries.nameEn,
        countries.nameEs,
        countries.iso,
        cities.nameEn,

        commentCountSubquery.count,
        publicationsReactions.userId,
        publicationsReactions.reactionType,
      )
      .orderBy(desc(forumPublications.createdAt))
      .limit(limit)
      .offset(offset);

    const rawResults = (await baseQuery) as unknown as BaseQueryResult[];

    const processedResults: Publication[] = rawResults.map(
      (row): Publication => {
        const baseResult: BasePublication = {
          id: row.id,
          headline: row.headline,
          content: row.content,
          mediaUrl: row.mediaUrl,
          createdAt: row.createdAt,
          author: row.author,
          location: row.location,
          media: row.media,
          commentCount: Number(row.commentCount || 0),
          userReaction: row.userReaction,
          dislikeCount: Number(row.dislikeCount || 0),
        };

        if (row.section === 'need') {
          return {
            ...baseResult,
            section: 'need',
            signCount: Number(row.signCount || 0),
          };
        }

        return {
          ...baseResult,
          section: row.section as 'doubt' | 'dream',
          likeCount: Number(row.likeCount || 0),
        };
      },
    );

    return processedResults;
  }

  async deletePublication(publicationId: string, userId: string) {
    return await this.drizzleService.db
      .delete(forumPublications)
      .where(
        and(
          eq(forumPublications.id, publicationId),
          eq(forumPublications.authorId, userId),
        ),
      );
  }
}
