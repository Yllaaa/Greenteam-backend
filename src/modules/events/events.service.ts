import {
  Injectable,
  HttpStatus,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { EventsRepository } from './events.repository';
import { EventsDto } from './dto/events.dto';
import { PostgresError } from 'postgres';

@Injectable()
export class EventsService {
  readonly EVENTS_PER_PAGE = 10;

  constructor(readonly eventsRepository: EventsRepository) {}

  async createEvent(event: EventsDto, userId: string) {
    event.creatorId ||= userId;
    return await this.eventsRepository.createEvent(event);
  }

  async getEvents(category, page: number, limit: number) {
    return await this.eventsRepository.getEvents(category, page, limit);
  }

  async getEventDetails(id: string) {
    return await this.eventsRepository.getEventDetails(id);
  }

  async eventExist(event_id: string) {
    return (await this.eventsRepository.getEvent(event_id)) != undefined;
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
}
