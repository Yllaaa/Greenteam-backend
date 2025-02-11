import { Injectable } from '@nestjs/common';
import { DrizzleService } from '../db/drizzle.service';
import { pages, pagesContacts, pagesLikes } from '../db/schemas/schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class PagesRepository {
    constructor(
        private readonly drizzleService: DrizzleService
    ) { }

    async createPage(page: any){
        return await this.drizzleService.db.insert(pages).values(page)
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
                contacts: true,
                likes: {
                    columns: {},
                    with:{
                        user: {
                            columns: {
                                fullName: true,
                                avatar: true
                            }
                        }
                    }
                }
            }
        })
    }

    async getPageId(userId: string){
        return await this.drizzleService.db.query.pages.findFirst({
            where: eq(pages.owner_id, userId),
            columns: {
                id: true
            }
        })
    }

    async addPageContact(contact: any){
        return await this.drizzleService.db.insert(pagesContacts).values(contact)
    }

    async addPageLike(page_id: string, user_id: string){
        return await this.drizzleService.db.insert(pagesLikes).values({
            page_id: page_id,
            user_id: user_id
        })
    }
}
