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

import { getNotificationMessage } from 'src/modules/notifications/notification-messages';
import { UsersService } from 'src/modules/users/users.service';
import { NotificationQueueService } from 'src/modules/common/queues/notification-queue/notification-queue.service';
import { I18nService, I18nContext } from 'nestjs-i18n';
@Injectable()
export class PagesService {
  constructor(
    private readonly pagesRepository: PagesRepository,
    private readonly uploadMediaService: UploadMediaService,
    private readonly commonService: CommonService,
    private readonly i18n: I18nService,
    private readonly usersService: UsersService,
    private readonly notificationQueueService: NotificationQueueService,
  ) {}

  async createPage(data: { page: CreatePageDto; images: any }, user: any) {
    const { page, images } = data;
    const { avatar, cover } = images;
    const ownerId = user.id;
    if (page.slug.length > 50) {
      throw new BadRequestException('pages.pages.validations.LONG_SLUG');
    }
    if (await this.pagesRepository.checkSlugTaken(page.slug)) {
      throw new NotFoundException(
        this.i18n.translate('pages.pages.validations.SLUG_TAKEN', {
          args: { slug: page.slug },
        }),
      );
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
      throw new NotFoundException(
        this.i18n.translate('pages.pages.errors.SLUG_PAGE_NOT_FOUND', {
          args: { slug },
        }),
      );
    }

    if (pageData.ownerId !== userId) {
      throw new ForbiddenException('pages.pages.errors.NOT_AUTHORIZED');
    }
    if (pageData.countryId && pageData.cityId) {
      await this.commonService.validateLocation(page.countryId, page.cityId);
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
    const pages = await this.pagesRepository.getAllPages(query, userId);
    return pages.map((page) => {
      return {
        ...page,
        isOwner: page.ownerId === userId,
      };
    });
  }

  async getPageDetails(slug: string, userId: string) {
    const pageDetails = await this.pagesRepository.getPageDetails(slug, userId);
    const lang = I18nContext.current()?.lang || 'en'; // Default to English if no language context

    if (!pageDetails) {
      throw new NotFoundException(
        this.i18n.translate('pages.pages.errors.SLUG_PAGE_NOT_FOUND', {
          args: { slug },
        }),
      );
    }
    const countryName =
      lang === 'es' ? pageDetails.country?.nameEs : pageDetails.country?.nameEn;

    const isAdmin = pageDetails.ownerId === userId;
    const { ownerId, ...pageWithoutOwnerId } = pageDetails;

    return {
      ...pageWithoutOwnerId,
      country: pageDetails.country
        ? {
            id: pageDetails.country.id,
            name: countryName,
          }
        : null,
      isAdmin,
    };
  }

  async getPageOwnerId(pageId: string) {
    const page = await this.pagesRepository.getPageOwnerId(pageId);
    if (!page) {
      throw new NotFoundException(
        this.i18n.translate('pages.pages.errors.PAGE_ID_NOT_FOUND', {
          args: { pageId },
        }),
      );
    }
    return page.ownerId;
  }

  async addPageContact(
    contact: CreatePageContactDto,
    slug: string,
    userId: string,
  ) {
    const page = await this.pagesRepository.getPageBySlug(slug);
    if (!page) {
      throw new NotFoundException(
        this.i18n.translate('pages.pages.errors.SLUG_PAGE_NOT_FOUND', {
          args: { slug },
        }),
      );
    }

    if (page.ownerId !== userId) {
      throw new BadRequestException('pages.pages.errors.NOT_AUTHORIZED');
    }

    return await this.pagesRepository.addPageContact(contact, page.id);
  }

  async getPageContactsBySlug(slug: string) {
    const page = await this.pagesRepository.getPageBySlug(slug);
    if (!page) {
      throw new NotFoundException(
        this.i18n.translate('pages.pages.errors.SLUG_PAGE_NOT_FOUND', {
          args: { slug },
        }),
      );
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
      throw new NotFoundException(
        this.i18n.translate('pages.pages.errors.CONTACT_ID_NOT_FOUND', {
          args: { contactId },
        }),
      );
    }

    const pageOwnerId = await this.getPageOwnerId(contact.pageId);
    if (pageOwnerId !== userId) {
      throw new BadRequestException('pages.pages.errors.NOT_AUTHORIZED');
    }

    return await this.pagesRepository.deletePageContact(contactId);
  }

  async getPageBySlug(slug: string) {
    return await this.pagesRepository.getPageBySlug(slug);
  }

  async togglePageFollow(slug: string, user: any) {
    const page = await this.pagesRepository.getPageBySlug(slug);
    if (!page) {
      throw new NotFoundException(
        this.i18n.translate('pages.pages.errors.SLUG_PAGE_NOT_FOUND', {
          args: { slug },
        }),
      );
    }

    const pageId = page.id;
    const pageOwnerId = page.ownerId;
    const pageName = page.name;

    const existingFollow = await this.pagesRepository.getPageFollower(
      pageId,
      user.id,
    );

    if (existingFollow) {
      await this.pagesRepository.removePageFollower(pageId, user.id);
      return { success: true, followed: false };
    }

    await this.pagesRepository.addPageFollower(pageId, user.id);

    if (pageOwnerId && pageOwnerId !== user.id) {
      await this.sendPageFollowNotification(
        user.id,
        pageOwnerId,
        page.slug,
        pageName,
      );
    }

    return { success: true, followed: true };
  }

  async getPageById(pageId: string) {
    const page = await this.pagesRepository.getPageById(pageId);
    if (!page) {
      throw new NotFoundException(
        this.i18n.translate('pages.pages.errors.PAGE_ID_NOT_FOUND', {
          args: { pageId },
        }),
      );
    }
    return page;
  }

  async getPageMetadata(pageId: string) {
    return await this.pagesRepository.getPageMetadata(pageId);
  }

  async deletePage(slug: string, userId: string) {
    const page = await this.pagesRepository.getPageBySlug(slug);
    if (!page) {
      throw new NotFoundException(
        this.i18n.translate('pages.pages.errors.SLUG_PAGE_NOT_FOUND', {
          args: { slug },
        }),
      );
    }
    if (page.ownerId !== userId) {
      throw new ForbiddenException('pages.pages.errors.NOT_AUTHORIZED');
    }
    await this.pagesRepository.deletePage(page.id, userId);
    await this.pagesRepository.deletePagePosts(page.id);
    await this.pagesRepository.deletePageEvents(page.id);
    await this.pagesRepository.deletePageProducts(page.id);

    const translatedMessage = await this.i18n.t(
      'pages.pages.notifications.PAGE_DELETED',
    );
    return { message: translatedMessage };
  }

  private async getUserInfo(userId: string) {
    const user = await this.usersService.getUserById(userId);
    return user;
  }

  private async sendPageFollowNotification(
    followerId: string,
    pageOwnerId: string,
    pageSlug: string,
    pageName: string,
  ): Promise<void> {
    try {
      const followerInfo = await this.getUserInfo(followerId);
      const followerName = followerInfo?.fullName || 'Someone';

      const notificationMessages = getNotificationMessage(
        'followed_page',
        followerName,
        { pageName },
      );

      await this.notificationQueueService.addCreateNotificationJob({
        recipientId: pageOwnerId,
        actorId: followerId,
        type: 'followed_page',
        metadata: {
          followerId: followerId,
          pageSlug: pageSlug,
          pageName: pageName,
        },
        messageEn: notificationMessages.en,
        messageEs: notificationMessages.es,
      });
    } catch (error) {
      console.error('Failed to send page follow notification:', error);
    }
  }
}
