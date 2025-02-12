import { Injectable } from '@nestjs/common';
import { DrizzleService } from '../db/drizzle.service';
import { pages, pagesContacts, pagesFollowers } from '../db/schemas/schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class PagesRepository {
    constructor(
        private readonly drizzleService: DrizzleService
    ) { }

    async createPage(page: any){
        return await this.drizzleService.db.insert(pages).values(page).returning()
    }

    async getPage(userId: string){
        return await this.drizzleService.db.query.pages.findFirst({
            where: eq(pages.owner_id, userId),
            with: {
                owner: {
                    columns: {
                        fullName: true,
                        avatar: true
                    }
                },
                topic: true,
                contacts: true
            },
            extras: {
                followersCount: this.drizzleService.db.$count(pagesFollowers, eq(pagesFollowers.page_id, pages.id)).as('followersCount')
            }
        })
    }

    async getPageUserId(pageId: string){
        return await this.drizzleService.db.query.pages.findFirst({
            where: eq(pages.id, pageId),
            columns: {
                owner_id: true
            }
        })
    }

    async addPageContact(contact: any){
        return await this.drizzleService.db.insert(pagesContacts).values(contact).returning()
    }

    async addPageFollower(page_id: string, user_id: string){
        return await this.drizzleService.db.insert(pagesFollowers).values({
            page_id: page_id,
            user_id: user_id
        }).returning()
    }
}
