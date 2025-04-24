import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PagesRepository } from './pages.repository';
import { CreatePageDto } from './dto/create-pages.dto';
import { CreatePageContactDto } from './dto/create-page-contact.dto';
import { UploadMediaService } from 'src/modules/common/upload-media/upload-media.service';
import { CommonService } from 'src/modules/common/common.service';
import { GetAllPagesDto } from 'src/modules/pages/pages/dto/get-pages.dto';
import { UpdatePageDto } from './dto/update-page.dto';

@Injectable()
export class PagesService {
  constructor(
    private readonly pagesRepository: PagesRepository,
    private readonly uploadMediaService: UploadMediaService,
    private readonly commonService: CommonService,
  ) {}

  async createPage(data: { page: CreatePageDto; images: any }, user: any) {
    const { page, images } = data;
    const { avatar, cover } = images;
    const ownerId = user.id;
    if (page.slug.length > 50) {
      throw new BadRequestException('Slug is too long');
    }
    if (await this.pagesRepository.checkSlugTaken(page.slug)) {
      throw new NotFoundException(`Slug ${page.slug} is already taken`);
    }
    await this.commonService.validateLocation(page.countryId, page.cityId);
    let uploadedAvatar;
    if (avatar) {
      uploadedAvatar = await this.uploadMediaService.uploadSingleImage(
        avatar[0],
        'profiles',
      );
    }
    let uploadedCover;
    if (cover) {
      uploadedCover = await this.uploadMediaService.uploadSingleImage(
        cover[0],
        'profiles',
      );
    }

    const pageData = {
      ...page,
      avatar: uploadedAvatar?.location,
      cover: uploadedCover?.location,
    };
    return await this.pagesRepository.createPage(pageData, ownerId);
  }

  async checkSlugTaken(slug: string) {
    return await this.pagesRepository.checkSlugTaken(slug);
  }

  async updatePage(
    data: { page: UpdatePageDto; images: any },
    slug: string,
    userId: string,
  ) {
    const { page, images } = data;
    const { avatar, cover } = images;

    const pageData = await this.pagesRepository.getPageBySlug(slug);
    if (!pageData) {
      throw new NotFoundException(`Page with slug ${slug} not found`);
    }

    if (pageData.ownerId !== userId) {
      throw new ForbiddenException('You are not the owner of this page');
    }

    let uploadedAvatar;
    if (avatar) {
      uploadedAvatar = await this.uploadMediaService.uploadSingleImage(
        avatar[0],
        'profiles',
      );
    }
    let uploadedCover;
    if (cover) {
      uploadedCover = await this.uploadMediaService.uploadSingleImage(
        cover[0],
        'profiles',
      );
    }
    const pageToUpdate = {
      ...page,
      avatar: uploadedAvatar?.location,
      cover: uploadedCover?.location,
    };

    return await this.pagesRepository.updatePage(pageToUpdate, slug);
  }

  async getAllPages(query: GetAllPagesDto, userId: string) {
    return await this.pagesRepository.getAllPages(query, userId);
  }

  async getPageDetails(slug: string, userId: string) {
    const pageDetails = await this.pagesRepository.getPageDetails(slug, userId);

    if (!pageDetails) {
      throw new NotFoundException(`Page with slug ${slug} not found`);
    }

    const isAdmin = pageDetails.ownerId === userId;

    const { ownerId, ...pageWithoutOwnerId } = pageDetails;

    return { ...pageWithoutOwnerId, isAdmin };
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

  async getPageContactsBySlug(slug: string) {
    const page = await this.pagesRepository.getPageBySlug(slug);
    if (!page) {
      throw new NotFoundException(`Page with slug ${slug} not found`);
    }
    return await this.pagesRepository.getPageContacts(page?.id);
  }

  async getPageContactsById(contactId: string) {
    const contact = await this.pagesRepository.getPageContacts(contactId);

    return contact;
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
