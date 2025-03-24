import { Injectable, NotFoundException } from '@nestjs/common';
import { DrizzleService } from '../../db/drizzle.service';

import { eq, and, count } from 'drizzle-orm';
import {
  events,
  pages,
  pagesContacts,
  pagesFollowers,
  posts,
} from 'src/modules/db/schemas/schema';

@Injectable()
export class PagesRepository {
  constructor(private readonly drizzleService: DrizzleService) {}

  async createPage(page: any) {
    return await this.drizzleService.db.insert(pages).values(page).returning();
  }

  async getPage(userId: string) {
    const page = await this.drizzleService.db.query.pages.findFirst({
      where: eq(pages.ownerId, userId),
      with: {
        owner: {
          columns: {
            fullName: true,
            avatar: true,
          },
        },
        topic: true,
        contacts: true,
        followers: true,
      },
    });

    if (!page) return null;

    // Count followers separately
    const followersCount = await this.drizzleService.db
      .select({ count: count() })
      .from(pagesFollowers)
      .where(eq(pagesFollowers.page_id, page.id))
      .execute();

    return {
      ...page,
      followersCount: followersCount[0]?.count || 0,
    };
  }

  async getPageOwnerId(pageId: string) {
    return await this.drizzleService.db.query.pages.findFirst({
      where: eq(pages.id, pageId),
      columns: {
        ownerId: true,
      },
    });
  }

  async getPageMetadata(pageId: string) {
    return await this.drizzleService.db.query.pages.findFirst({
      where: eq(pages.id, pageId),
      columns: {
        id: true,
        ownerId: true,
        countryId: true,
        cityId: true,
      },
    });
  }

  async addPageContact(contact: any) {
    return await this.drizzleService.db
      .insert(pagesContacts)
      .values(contact)
      .returning();
  }

  async addPageFollower(page_id: string, user_id: string) {
    return await this.drizzleService.db
      .insert(pagesFollowers)
      .values({
        page_id: page_id,
        user_id: user_id,
      })
      .returning();
  }

  async getPagePosts(pageId: string, limit: number = 10, offset: number = 0) {
    return await this.drizzleService.db.query.posts.findMany({
      where: and(eq(posts.creatorId, pageId), eq(posts.creatorType, 'page')),
      with: {
        mainTopic: true,
        subTopics: {
          with: {
            topic: true,
          },
        },
        comments: {
          with: {
            author: {
              columns: {
                id: true,
                fullName: true,
                avatar: true,
              },
            },
            reactions: true,
          },
        },
        reactions: {
          with: {
            user: {
              columns: {
                id: true,
                fullName: true,
                avatar: true,
              },
            },
          },
        },
      },
      orderBy: (posts, { desc }) => [desc(posts.createdAt)],
      limit: limit,
      offset: offset,
    });
  }

  async getPageById(pageId: string) {
    const page = await this.drizzleService.db.query.pages.findFirst({
      where: eq(pages.id, pageId),
      with: {
        owner: {
          columns: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        topic: true,
        contacts: true,
        followers: true,
      },
    });

    if (!page) return null;

    const followersCount = await this.drizzleService.db
      .select({ count: count() })
      .from(pagesFollowers)
      .where(eq(pagesFollowers.page_id, page.id))
      .execute();

    return {
      ...page,
      followersCount: followersCount[0]?.count || 0,
    };
  }

  async getPageEvents(pageId: string, limit: number = 10, offset: number = 0) {
    return await this.drizzleService.db.query.events.findMany({
      where: and(eq(events.creatorId, pageId), eq(events.creatorType, 'page')),
      with: {
        usersJoined: {
          with: {
            user: {
              columns: {
                id: true,
                fullName: true,
                avatar: true,
              },
            },
          },
        },
      },
      orderBy: (events, { desc }) => [desc(events.startDate)],
      limit: limit,
      offset: offset,
    });
  }
}
