import {
  Injectable,
  HttpStatus,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { EventsRepository } from './events.repository';
import { CreateEventDto } from './dto/events.dto';
import { PostgresError } from 'postgres';
import { SQL } from 'drizzle-orm';
import { GetEventsDto } from './dto/getEvents.dto';
import { UploadMediaService } from 'src/modules/common/upload-media/upload-media.service';
import { CommonRepository } from 'src/modules/common/common.repository';
import { CommonService } from 'src/modules/common/common.service';

@Injectable()
export class EventsService {
  constructor(
    readonly eventsRepository: EventsRepository,
    readonly uploadMediaService: UploadMediaService,
    readonly commonRepository: CommonRepository,
    readonly commonService: CommonService,
  ) {}

  async createEvent(
    event: { dto: CreateEventDto; poster: any },
    userId: string,
  ) {
    const { dto } = event;
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
      userId,
    );
  }

  async getEvents(dto: GetEventsDto, userId?: string) {
    const events = await this.eventsRepository.getEvents(dto, userId);

    return await Promise.all(
      events.map(async (event) => {
        const hostName = await this.GetEventHostName(event);
        console.log('hostName', hostName);
        const { userCreator, pageCreator, ...rest } = event;

        return {
          ...rest,
          hostName,
          isAuthor: event.creatorId === userId,
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
  async deleteEvent(id: string, userId: string) {
    const event = await this.eventsRepository.getEventById(id);
    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (event.creatorId !== userId) {
      throw new BadRequestException('You are not the creator of this event');
    }

    return await this.eventsRepository.deleteEvent(id, userId);
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
