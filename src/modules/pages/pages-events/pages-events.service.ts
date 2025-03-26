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

@Injectable()
export class PagesEventsService {
  constructor(
    private readonly eventsRepository: EventsRepository,
    private readonly pagesService: PagesService,
  ) {}

  async createEvent(event: CreateEventDto, slug: string, userId: string) {
    if (event.creatorType != ('page' as CreatorType)) {
      throw new HttpException('Only pages can create events', 400);
    }
    const page = await this.pagesService.getPageBySlug(slug);
    if (!page) {
      throw new NotFoundException('Page not found');
    }
    if (page.ownerId !== userId) {
      throw new UnauthorizedException('You are not the owner of this page');
    }
    return await this.eventsRepository.createEvent(event, page.id);
  }

  async getEvents(dto: GetEventsDto, slug: string, userId) {
    const page = await this.pagesService.getPageBySlug(slug);
    if (!page) {
      throw new NotFoundException('Page not found');
    }
    const events = await this.eventsRepository.getEvents(dto, userId, page.id);
    return events.map((event) => {
      const { pageCreator, ...rest } = event;
      return {
        ...rest,
        hostName: pageCreator?.name ?? 'Unknown Host',
      };
    });
  }

  async getEventDetails(id: string, userId: string) {
    return await this.eventsRepository.getEventDetails(id, userId);
  }
}
