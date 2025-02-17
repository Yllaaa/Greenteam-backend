import { Injectable } from '@nestjs/common';
import { PagesRepository } from './pages.repository';
import { PageDto } from './dto/pages.dto';
import { PageContactDto } from './dto/page-contact.dto';

@Injectable()
export class PagesService {
    constructor(
        private readonly pagesRepository: PagesRepository
    ){}

    async createPage(page: PageDto, user: any){
        page.owner_id = user.id
        return await this.pagesRepository.createPage(page)
    }

    async getPage(user: any){
        return await this.pagesRepository.getPage(user.id)
    }

    async getPageUserId(pageId: string){
        return (await this.pagesRepository.getPageUserId(pageId))?.owner_id
    }

    async addPageContact(contact: PageContactDto, page_id: string){
        contact.page_id = page_id
        return await this.pagesRepository.addPageContact(contact)
    }

    async addPageFollower(page_id: string, user: any){
        return await this.pagesRepository.addPageFollower(page_id, user.id)
    }
}
