import { Injectable, NotFoundException } from '@nestjs/common';
import { DrizzleService } from '../db/drizzle.service';
import { events, pages, pagesContacts, pagesFollowers, posts, usersJoinedEvent } from '../db/schemas/schema';
import { eq, and, count, sql } from 'drizzle-orm';

@Injectable()
export class PagesRepository {
  constructor(
    private readonly drizzleService: DrizzleService
  ) { }

  async createPage(page: any) {
    return await this.drizzleService.db.insert(pages).values(page).returning();
  }

  async getPage(userId: string) {
    const page = await this.drizzleService.db.query.pages.findFirst({
      where: eq(pages.owner_id, userId),
      with: {
        owner: {
          columns: {
            fullName: true,
            avatar: true
          }
        },
        topic: true,
        contacts: true,
      }
    });

    if (!page) return null;

    // Count followers separately
    const followersCount = await this.drizzleService.db.select({ count: count() })
      .from(pagesFollowers)
      .where(eq(pagesFollowers.page_id, page.id))
      .execute();

    return {
      ...page,
      followersCount: followersCount[0]?.count || 0
    };
  }

  async getPageUserId(pageId: string) {
    return await this.drizzleService.db.query.pages.findFirst({
      where: eq(pages.id, pageId),
      columns: {
        owner_id: true
      }
    });
  }

  async addPageContact(contact: any) {
    return await this.drizzleService.db.insert(pagesContacts).values(contact).returning();
  }

  async addPageFollower(page_id: string, user_id: string) {
    return await this.drizzleService.db.insert(pagesFollowers).values({
      page_id: page_id,
      user_id: user_id
    }).returning();
  }

  async getPagePosts(pageId: string, limit: number = 10, offset: number = 0) {
    const postsResult = await this.drizzleService.db.query.posts.findMany({
      where: and(
        eq(posts.creatorId, pageId),
        eq(posts.creatorType, 'page')
      ),
      with: {
        mainTopic: true,
        subTopics: {
          with: {
            topic: true
          }
        }
      },
      extras: {
        commentsCount: sql<number>`(
          SELECT COUNT(*)::integer
          FROM public.publications_comments
          WHERE publications_comments.publication_id = ${posts.id}
          AND publications_comments.publication_type = 'post'
        )`.as('comments_count'),
        likesCount: sql<number>`(
          SELECT COUNT(*)::integer
          FROM public.publications_reactions
          WHERE publications_reactions.reactionable_id = ${posts.id}
          AND publications_reactions.reactionable_type = 'post'
          AND publications_reactions.reaction_type = 'like'
        )`.as('likes_count'),
        dislikesCount: sql<number>`(
          SELECT COUNT(*)::integer
          FROM public.publications_reactions
          WHERE publications_reactions.reactionable_id = ${posts.id}
          AND publications_reactions.reactionable_type = 'post'
          AND publications_reactions.reaction_type = 'dislike'
        )`.as('dislikes_count')
      },
      orderBy: (posts, { desc }) => [desc(posts.createdAt)],
      limit,
      offset
    });
   
    return postsResult.map(post => ({
      ...post,
      commentsCount: Number(post.commentsCount) || 0,
      likesCount: Number(post.likesCount) || 0,
      dislikesCount: Number(post.dislikesCount) || 0
    }));
   }

  async getPageById(pageId: string) {
    const page = await this.drizzleService.db.query.pages.findFirst({
      where: eq(pages.id, pageId),
      with: {
        owner: {
          columns: {
            id: true,
            fullName: true,
            avatar: true
          }
        },
        topic: true,
        contacts: true,
      }
    });

    if (!page) return null;

    const followersCount = await this.drizzleService.db.select({ count: count() })
      .from(pagesFollowers)
      .where(eq(pagesFollowers.page_id, page.id))
      .execute();

    return {
      ...page,
      followersCount: followersCount[0]?.count || 0
    };
  }

  async getPageEvents(pageId: string, limit: number = 10, offset: number = 0) {
    const eventsResult = await this.drizzleService.db.query.events.findMany({
      where: and(
        eq(events.creatorId, pageId),
        eq(events.creatorType, 'page')
      ),
      extras: {
        joinedUsersCount: sql<number>`
              (SELECT COUNT(*) 
               FROM ${usersJoinedEvent} 
               WHERE ${usersJoinedEvent.eventId} = ${events.id})
            `.as('joined_users_count')
      },
      orderBy: (events, { desc }) => [desc(events.startDate)],
      limit,
      offset
    });

    return eventsResult.map(event => ({
      ...event,
      joinedUsersCount: event.joinedUsersCount || 0
    }));
  }
}