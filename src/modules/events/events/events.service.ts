import {
  Injectable,
  HttpStatus,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { EventsRepository } from './events.repository';
import { EventsDto } from './dto/events.dto';
import { PostgresError } from 'postgres';
import { SQL } from 'drizzle-orm';

@Injectable()
export class EventsService {
  readonly EVENTS_PER_PAGE = 10;

  constructor(readonly eventsRepository: EventsRepository) {}

  async createEvent(event: EventsDto, userId: string) {
    event.creatorId ||= userId;
    return await this.eventsRepository.createEvent(event);
  }

  async getEvents(
    pagination: {
      page: number;
      limit: number;
    },
    category: SQL<'social' | 'volunteering&work' | 'talks&workshops'>,
    userId?: string,
  ) {
    const events = await this.eventsRepository.getEvents(
      pagination,
      category,
      userId,
    );

    return await Promise.all(
      events.map(async (event) => {
        const hostName = await this.GetEventHostName(event);

        const { userCreator, pageCreator, ...rest } = event;

        return {
          ...rest,
          hostName,
        };
      }),
    );
  }

  async getEventDetails(id: string, userId: string) {
    return await this.eventsRepository.getEventDetails(id, userId);
  }

  async eventExist(eventId: string) {
    return (await this.eventsRepository.getEventById(eventId)) != undefined;
  }

  async addUserJoinedEvent(eventId: string, userId: string) {
    try {
      if (!(await this.eventExist(eventId))) {
        throw new NotFoundException('Event not found');
      }

      return await this.eventsRepository.addUserJoinedEvent(eventId, userId);
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException('User already joined this event');
      }

      throw error;
    }
  }

  async removeUserJoinedEvent(eventId: string, userId: string) {
    if (!(await this.eventExist(eventId))) {
      throw new NotFoundException('Event not found');
    }
    if (!(await this.eventsRepository.checkUserJoinedEvent(eventId, userId))) {
      throw new NotFoundException('User has not joined this event');
    }
    return await this.eventsRepository.removeUserJoinedEvent(eventId, userId);
  }

  private async GetEventHostName(event) {
    const hostedByStr = String(event.hostedBy);

    if (hostedByStr === 'Greenteam') {
      return 'Greenteam';
    } else if (hostedByStr === 'Global') {
      return 'Global';
    }
    return event?.userCreator?.fullName || event?.pageCreator?.name || null;
  }
}
