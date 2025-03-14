import { Injectable, NotFoundException } from '@nestjs/common';
import { PagesRepository } from './pages.repository';
import { PageDto } from './dto/pages.dto';
import { PageContactDto } from './dto/page-contact.dto';
import { PageProfileDto } from './dto/profile.dto';

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
        const page = await this.pagesRepository.getPageUserId(pageId)
        if (!page) {
            throw new NotFoundException(`Page with ID ${pageId} not found`)
        }
        return page.owner_id;
    }

    async addPageContact(contact: PageContactDto, page_id: string){
        contact.page_id = page_id
        return await this.pagesRepository.addPageContact(contact)
    }

    async addPageFollower(page_id: string, user: any){
        return await this.pagesRepository.addPageFollower(page_id, user.id)
    }

    async getPagePosts(pageId: string, limit?: number, offset?: number) {
        const page = await this.pagesRepository.getPageById(pageId);
        if (!page) {
            throw new NotFoundException(`Page with ID ${pageId} not found`);
        }
        
        return await this.pagesRepository.getPagePosts(pageId, limit, offset);
    }
    
    async getPageById(pageId: string) {
        const page = await this.pagesRepository.getPageById(pageId);
        if (!page) {
            throw new NotFoundException(`Page with ID ${pageId} not found`);
        }
        return page;
    }

    async getPageEvents(pageId: string, limit?: number, offset?: number) {
        const page = await this.pagesRepository.getPageById(pageId);
        if (!page) {
            throw new NotFoundException(`Page with ID ${pageId} not found`);
        }
        return this.pagesRepository.getPageEvents(pageId, limit, offset);
    }

    async getPageProfile(pageId: string, limit?: number, offset?: number): Promise<PageProfileDto> {
        // 1. Get all data in parallel to improve performance
        const [page, posts, events] = await Promise.all([
          this.pagesRepository.getPageById(pageId),
          this.pagesRepository.getPagePosts(pageId, limit, offset),
          this.pagesRepository.getPageEvents(pageId, limit, offset)
        ]).catch(error => {
          throw new NotFoundException(`Profile for page with ID ${pageId} could not be retrieved: ${error.message}`);
        });
      
        // 2. Check if page exists
        if (!page) {
          throw new NotFoundException(`Page with ID ${pageId} not found`);
        }
      
        // 3. Extract a helper method for formatting the page info
        return {
          pageInfo: this.formatPageInfo(page),
          posts,
          events
        };
      }
      
      // Helper method to normalize and format page info
      private formatPageInfo(page: any): PageProfileDto['pageInfo'] {
        const owner = Array.isArray(page.owner) ? page.owner[0] : page.owner;
        const topic = Array.isArray(page.topic) ? page.topic[0] : page.topic;
        const contacts = Array.isArray(page.contacts) ? page.contacts : 
                         (page.contacts ? [page.contacts] : []);
        
        return {
          id: page.id,
          name: page.name,
          description: page.description,
          avatar: page.avatar,
          cover: page.cover,
          category: page.category,
          why: page.why,
          how: page.how,
          what: page.what,
          topic: {
            id: topic?.id ?? 0,
            name: topic?.name ?? ''
          },
          owner: {
            id: owner?.id ?? '',
            fullName: owner?.fullName ?? '',
            avatar: owner?.avatar ?? ''
          },
          contacts: contacts.map(contact => ({
            name: contact.name ?? '',
            title: contact.title ?? '',
            email: contact.email ?? '',
            phone_num: contact.phone_num ?? '',
            personal_picture: contact.personal_picture ?? ''
          })),
          followersCount: page.followersCount ?? 0
        };
      }
}