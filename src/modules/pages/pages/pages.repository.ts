import { Injectable, NotFoundException } from '@nestjs/common';
import { DrizzleService } from '../../db/drizzle.service';

import { eq, and, count } from 'drizzle-orm';
import {
  events,
  PageCategoryType,
  pages,
  pagesContacts,
  pagesFollowers,
  posts,
} from 'src/modules/db/schemas/schema';
import { CreatePageContactDto } from './dto/create-page-contact.dto';

@Injectable()
export class PagesRepository {
  constructor(private readonly drizzleService: DrizzleService) {}

  async createPage(
    page: {
      topicId: number;
      countryId: number;
      cityId: number;
      category: PageCategoryType;
      name: string;
      description: string;
      slug: string;
      why: string;
      how: string;
      what: string;
      websiteUrl?: string;
    },
    ownerId: string,
  ) {
    return await this.drizzleService.db
      .insert(pages)
      .values({
        name: page.name,
        description: page.description,
        slug: page.slug,
        topicId: page.topicId,
        countryId: page.countryId,
        cityId: page.cityId,
        category: page.category,
        why: page.why,
        how: page.how,
        what: page.what,
        ownerId,
        websiteUrl: page.websiteUrl ?? null,
      })
      .returning();
  }

  async checkSlugTaken(slug: string) {
    const page = await this.drizzleService.db.query.pages.findFirst({
      where: eq(pages.slug, slug),
    });
    return !!page;
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

  async addPageContact(contact: CreatePageContactDto, pageId: string) {
    return await this.drizzleService.db
      .insert(pagesContacts)
      .values({
        pageId: pageId,
        name: contact.name,
        title: contact.title,
        email: contact.email,
        phoneNum: contact.phoneNum,
      })
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

  async getPageBySlug(slug: string) {
    return await this.drizzleService.db.query.pages.findFirst({
      where: eq(pages.slug, slug),
      columns: {
        id: true,
        slug: true,
        ownerId: true,
      },
    });
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
