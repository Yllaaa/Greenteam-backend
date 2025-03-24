import { Injectable, NotFoundException } from '@nestjs/common';
import { PagesRepository } from './pages.repository';
import { PageDto } from './dto/pages.dto';
import { PageContactDto } from './dto/page-contact.dto';
import { PageProfileDto } from './dto/profile.dto';

@Injectable()
export class PagesService {
  constructor(private readonly pagesRepository: PagesRepository) {}

  async createPage(page: PageDto, user: any) {
    page.owner_id = user.id;
    return await this.pagesRepository.createPage(page);
  }

  async getPage(user: any) {
    return await this.pagesRepository.getPage(user.id);
  }

  async getPageOwnerId(pageId: string) {
    const page = await this.pagesRepository.getPageOwnerId(pageId);
    if (!page) {
      throw new NotFoundException(`Page with ID ${pageId} not found`);
    }
    return page.ownerId;
  }

  async addPageContact(contact: PageContactDto, page_id: string) {
    contact.page_id = page_id;
    return await this.pagesRepository.addPageContact(contact);
  }

  async addPageFollower(page_id: string, user: any) {
    return await this.pagesRepository.addPageFollower(page_id, user.id);
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

  async getPageMetadata(pageId: string) {
    return await this.pagesRepository.getPageMetadata(pageId);
  }

  async getPageEvents(pageId: string, limit?: number, offset?: number) {
    const page = await this.pagesRepository.getPageById(pageId);
    if (!page) {
      throw new NotFoundException(`Page with ID ${pageId} not found`);
    }
    return this.pagesRepository.getPageEvents(pageId, limit, offset);
  }
}
