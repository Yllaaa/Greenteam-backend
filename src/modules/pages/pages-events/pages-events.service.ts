import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  HttpException,
  HttpCode,
} from '@nestjs/common';
import { CreateEventDto } from 'src/modules/events/events/dto/events.dto';
import { EventsRepository } from 'src/modules/events/events/events.repository';
import { PagesService } from '../pages/pages.service';
import { CreatorType } from 'src/modules/db/schemas/schema';
import { GetEventsDto } from 'src/modules/events/events/dto/getEvents.dto';
import { UploadMediaService } from 'src/modules/common/upload-media/upload-media.service';
import { CommonService } from 'src/modules/common/common.service';
import { PagesEventsRepository } from './pages-events.repository';

@Injectable()
export class PagesEventsService {
  constructor(
    private readonly eventsRepository: EventsRepository,
    private readonly pagesEventsRepository: PagesEventsRepository,
    private readonly pagesService: PagesService,
    private readonly uploadMediaService: UploadMediaService,
    private readonly commonService: CommonService,
  ) {}

  async createEvent(
    event: { dto: CreateEventDto; poster: any },
    slug: string,
    userId: string,
  ) {
    const { dto } = event;
    if (dto.creatorType != ('page' as CreatorType)) {
      throw new HttpException('pages.events.errors.INVALID_CREATOR_TYPE', 400);
    }
    const page = await this.pagesService.getPageBySlug(slug);
    if (!page) {
      throw new NotFoundException('pages.events.errors.PAGE_NOT_FOUND');
    }
    if (page.ownerId !== userId) {
      throw new UnauthorizedException('pages.events.errors.NOT_PAGE_OWNER');
    }
    await this.commonService.validateLocation(dto.countryId, dto.cityId);
    let uploadedImage;
    if (event.poster) {
      uploadedImage = await this.uploadMediaService.uploadSingleImage(
        event.poster,
        'event_poster',
      );
    }
    return await this.eventsRepository.createEvent(
      { dto, posterUrl: uploadedImage?.location || null },
      page.id,
    );
  }

  async getEvents(dto: GetEventsDto, slug: string, userId) {
    const page = await this.pagesService.getPageBySlug(slug);
    if (!page) {
      throw new NotFoundException('pages.events.errors.PAGE_NOT_FOUND');
    }
    const events = await this.pagesEventsRepository.getEvents(
      dto,
      page.id,
      userId,
    );
    return events.map((event) => {
      const { pageCreator, ...rest } = event;
      return {
        ...rest,
        hostName: pageCreator?.name ?? 'Unknown Host',
        isAuthor: page.ownerId === userId,
      };
    });
  }

  async getEventDetails(id: string, userId: string) {
    return await this.eventsRepository.getEventDetails(id, userId);
  }

  async deleteEvent(id: string, slug: string, userId: string) {
    const page = await this.pagesService.getPageBySlug(slug);
    if (!page) {
      throw new NotFoundException('pages.pages.errors.PAGE_NOT_FOUND');
    }
    const event = await this.eventsRepository.getEventById(id);
    if (!event) {
      throw new NotFoundException('pages.events.errors.EVENT_NOT_FOUND');
    }

    if (event.creatorId !== page.id || page.ownerId !== userId) {
      throw new UnauthorizedException('pages.events.errors.NOT_EVENT_OWNER');
    }
    return await this.eventsRepository.deleteEvent(id, userId);
  }
}
