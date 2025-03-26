import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PagesRepository } from './pages.repository';
import { CreatePageDto } from './dto/create-pages.dto';
import { CreatePageContactDto } from './dto/create-page-contact.dto';

@Injectable()
export class PagesService {
  constructor(private readonly pagesRepository: PagesRepository) {}

  async createPage(page: CreatePageDto, user: any) {
    const ownerId = user.id;
    if (page.slug.length > 50) {
      throw new BadRequestException('Slug is too long');
    }
    if (await this.pagesRepository.checkSlugTaken(page.slug)) {
      throw new NotFoundException(`Slug ${page.slug} is already taken`);
    }

    return await this.pagesRepository.createPage(page, ownerId);
  }

  async checkSlugTaken(slug: string) {
    return await this.pagesRepository.checkSlugTaken(slug);
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

  async addPageContact(
    contact: CreatePageContactDto,
    pageSlug: string,
    userId: string,
  ) {
    const page = await this.pagesRepository.getPageBySlug(pageSlug);
    if (!page) {
      throw new NotFoundException(`Page with slug ${pageSlug} not found`);
    }

    if (page.ownerId !== userId) {
      throw new BadRequestException('You are not the owner of this page');
    }

    return await this.pagesRepository.addPageContact(contact, page.id);
  }

  async getPageContacts(slug: string) {
    const page = await this.pagesRepository.getPageBySlug(slug);
    if (!page) {
      throw new NotFoundException(`Page with slug ${slug} not found`);
    }
    return await this.pagesRepository.getPageContacts(page?.id);
  }

  async deletePageContact(contactId: string, userId: string) {
    const contact = await this.pagesRepository.getPageContactById(contactId);
    if (!contact) {
      throw new NotFoundException(`Contact with ID ${contactId} not found`);
    }

    const pageOwnerId = await this.getPageOwnerId(contact.pageId);
    if (pageOwnerId !== userId) {
      throw new BadRequestException('You are not the owner of this page');
    }

    return await this.pagesRepository.deletePageContact(contactId);
  }

  async getPageBySlug(slug: string) {
    return await this.pagesRepository.getPageBySlug(slug);
  }

  async togglePageFollow(slug: string, user: any) {
    const page = await this.pagesRepository.getPageBySlug(slug);
    if (!page) {
      throw new NotFoundException(`Page with slug ${slug} not found`);
    }
    const pageId = page.id;
    const existingFollow = await this.pagesRepository.getPageFollower(
      pageId,
      user.id,
    );
    if (existingFollow) {
      await this.pagesRepository.removePageFollower(pageId, user.id);
      return { success: true, followed: false };
    }
    await this.pagesRepository.addPageFollower(pageId, user.id);
    return { success: true, followed: true };
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
}
