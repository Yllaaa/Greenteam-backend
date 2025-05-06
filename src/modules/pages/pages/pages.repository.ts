import { Injectable, NotFoundException } from '@nestjs/common';
import { DrizzleService } from '../../db/drizzle.service';

import { eq, and, count, sql } from 'drizzle-orm';
import {
  events,
  PageCategoryType,
  pages,
  pagesContacts,
  pagesFollowers,
  posts,
  products,
} from 'src/modules/db/schemas/schema';
import { CreatePageContactDto } from './dto/create-page-contact.dto';
import { GetAllPagesDto } from 'src/modules/pages/pages/dto/get-pages.dto';

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
      avatar?: string;
      cover?: string;
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
        avatar: page.avatar ?? null,
        cover: page.cover ?? null,
        ownerId,
        websiteUrl: page.websiteUrl ?? null,
      })
      .returning();
  }

  async updatePage(
    page: {
      topicId: number;
      category: PageCategoryType;
      name: string;
      description: string;
      why: string;
      how: string;
      what: string;
      avatar?: string;
      cover?: string;
      websiteUrl?: string;
    },
    slug: string,
  ) {
    return await this.drizzleService.db
      .update(pages)
      .set({
        name: page.name,
        description: page.description,
        topicId: page.topicId,

        category: page.category,
        why: page.why,
        how: page.how,
        what: page.what,
        avatar: page.avatar,
        cover: page.cover,
        websiteUrl: page.websiteUrl,
      })
      .where(eq(pages.slug, slug))
      .returning();
  }

  async checkSlugTaken(slug: string) {
    const page = await this.drizzleService.db.query.pages.findFirst({
      where: eq(pages.slug, slug),
    });
    return !!page;
  }

  async getAllPages(query: GetAllPagesDto, userId: string) {
    const { countryId, cityId, limit, page } = query;
    const offset = (page - 1) * limit;
    const whereConditions: Array<ReturnType<typeof eq>> = [];

    if (countryId) {
      whereConditions.push(eq(pages.countryId, countryId));
    }
    if (cityId) {
      whereConditions.push(eq(pages.cityId, cityId));
    }

    const pagesList = await this.drizzleService.db.query.pages.findMany({
      columns: {
        id: true,
        name: true,
        slug: true,
        why: true,
        what: true,
        how: true,
        avatar: true,
        cover: true,
        category: true,
        ownerId: true,
      },
      with: {
        topic: {
          columns: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: (pages, { desc }) => [desc(pages.createdAt)],
      limit,
      offset,
      where: whereConditions.length > 0 ? and(...whereConditions) : undefined,
      extras: {
        followersCount: sql<number>`(
          SELECT CAST(count(*) AS INTEGER)
          FROM ${pagesFollowers} pf
          WHERE pf.page_id = ${pages.id}
        )`
          .mapWith(Number)
          .as('followers_count'),
        isFollowing: sql<boolean>`(
          SELECT EXISTS(
            SELECT 1
            FROM ${pagesFollowers} pf
            WHERE pf.page_id = ${pages.id} AND pf.user_id = ${userId}
          )
        )`
          .mapWith(Boolean)
          .as('is_following'),
      },
    });
    return pagesList;
  }

  async getPageDetails(slug: string, userId: string) {
    const page = await this.drizzleService.db.query.pages.findFirst({
      where: eq(pages.slug, slug),
      columns: {
        id: true,
        name: true,
        description: true,
        slug: true,
        websiteUrl: true,
        why: true,
        what: true,
        how: true,
        avatar: true,
        cover: true,
        category: true,
        ownerId: true,
        createdAt: true,
      },
      with: {
        topic: {
          columns: {
            id: true,
            name: true,
          },
        },
      },
      extras: {
        followersCount: sql<number>`(
          SELECT CAST(count(*) AS INTEGER) 
          FROM ${pagesFollowers} pf 
          WHERE pf.page_id = ${pages.id}
        )`
          .mapWith(Number)
          .as('followers_count'),
        isFollowing: sql<boolean>`(
          SELECT EXISTS(
            SELECT 1 
            FROM ${pagesFollowers} pf 
            WHERE pf.page_id = ${pages.id} AND pf.user_id = ${userId}
          )
        )`
          .mapWith(Boolean)
          .as('is_following'),
      },
    });

    return page;
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

  async getPageContacts(pageId: string) {
    return await this.drizzleService.db.query.pagesContacts.findMany({
      where: eq(pagesContacts.pageId, pageId),
      columns: {
        id: true,
        name: true,
        title: true,
        email: true,
        phoneNum: true,
      },
    });
  }
  async deletePageContact(contactId: string) {
    return await this.drizzleService.db
      .delete(pagesContacts)
      .where(eq(pagesContacts.id, contactId));
  }

  async getPageContactById(contactId: string) {
    return await this.drizzleService.db.query.pagesContacts.findFirst({
      where: eq(pagesContacts.id, contactId),
    });
  }

  async addPageFollower(pageId: string, userId: string) {
    return await this.drizzleService.db
      .insert(pagesFollowers)
      .values({
        pageId,
        userId,
      })
      .returning();
  }
  async getPageFollower(pageId: string, userId: string) {
    return await this.drizzleService.db.query.pagesFollowers.findFirst({
      where: and(
        eq(pagesFollowers.pageId, pageId),
        eq(pagesFollowers.userId, userId),
      ),
    });
  }
  async removePageFollower(pageId: string, userId: string) {
    return await this.drizzleService.db
      .delete(pagesFollowers)
      .where(
        and(
          eq(pagesFollowers.pageId, pageId),
          eq(pagesFollowers.userId, userId),
        ),
      );
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
      .where(eq(pagesFollowers.pageId, page.id))
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
        name: true,
        ownerId: true,
        countryId: true,
        cityId: true,
        topicId: true,
      },
    });
  }

  async deletePage(pageId: string, userId: string) {
    return await this.drizzleService.db
      .delete(pages)
      .where(and(eq(pages.id, pageId), eq(pages.ownerId, userId)));
  }
  async deletePagePosts(pageId: string) {
    return await this.drizzleService.db
      .delete(posts)
      .where(and(eq(posts.creatorId, pageId), eq(posts.creatorType, 'page')));
  }

  async deletePageEvents(pageId: string) {
    return await this.drizzleService.db
      .delete(events)
      .where(and(eq(events.creatorId, pageId), eq(events.creatorType, 'page')));
  }

  async deletePageProducts(pageId: string) {
    return await this.drizzleService.db
      .delete(products)
      .where(
        and(eq(products.sellerId, pageId), eq(products.sellerType, 'page')),
      );
  }
}
