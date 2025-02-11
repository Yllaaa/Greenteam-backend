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

    async getPage(id: string){
        return await this.pagesRepository.getPage(id)
    }

    async addPageContact(contact: PageContactDto, page_id: string){
        contact.page_id = page_id
        return await this.pagesRepository.addPageContact(contact)
    }

    async addPageLike(page_id: string, user: any){
        return await this.pagesRepository.addPageLike(page_id, user.id)
    }
}
