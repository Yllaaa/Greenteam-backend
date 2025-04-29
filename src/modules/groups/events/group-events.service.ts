import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { EventsRepository } from '../../events/events/events.repository';
import { GroupsRepository } from '../groups/groups.repository';
import { CreateEventDto } from '../../events/events/dto/events.dto';
import { EventsGroupRepository } from './group-events.repository';
import { UploadMediaService } from 'src/modules/common/upload-media/upload-media.service';
import { EventsService } from 'src/modules/events/events/events.service';
import { CommonService } from 'src/modules/common/common.service';

@Injectable()
export class GroupEventsService {
  constructor(
    private readonly eventsRepository: EventsRepository,
    private readonly groupsRepository: GroupsRepository,
    private readonly eventsGroupRepository: EventsGroupRepository,
    private readonly uploadMediaService: UploadMediaService,
    private readonly commonService: CommonService,
  ) {}

  async createGroupEvent(
    groupId: string,
    userId: string,
    eventData: { data: CreateEventDto; poster: Express.Multer.File },
  ) {
    const { data, poster } = eventData;
    const group = await this.groupsRepository.getGroupById(groupId);

    if (!group || !group.length) {
      throw new NotFoundException(`Group not found`);
    }

    if (group[0].ownerId !== userId) {
      throw new ForbiddenException(
        'Only group owners can create events for this group',
      );
    }
    await this.commonService.validateLocation(data.countryId, data.cityId);
    let uploadedImage;
    if (poster) {
      uploadedImage = await this.uploadMediaService.uploadSingleImage(
        poster,
        'event_poster',
      );
    }

    const event = {
      ...data,
      groupId: groupId,
    };

    return this.eventsRepository.createEvent(
      { dto: event, posterUrl: uploadedImage?.location || null },
      userId,
    );
  }

  async getGroupEvents(
    groupId: string,
    pagination: { page: number; limit: number },
  ) {
    const { page, limit } = pagination;
    const group = await this.groupsRepository.getGroupById(groupId);

    if (!group || !group.length) {
      throw new NotFoundException(`Group with ID ${groupId} not found`);
    }

    return this.eventsGroupRepository.getGroupEvents(groupId, { page, limit });
  }

  async getGroupEventDetails(groupId: string, eventId: string, userId: string) {
    const group = await this.groupsRepository.getGroupById(groupId);

    if (!group || !group.length) {
      throw new NotFoundException(`Group with ID ${groupId} not found`);
    }

    const event = await this.eventsRepository.getEventDetails(
      eventId,
      userId,
      groupId,
    );

    if (!event) {
      throw new NotFoundException(`Event not found`);
    }

    return event;
  }

  async deleteGroupEvent(groupId: string, eventId: string, userId: string) {
    const group = await this.groupsRepository.getGroupById(groupId);

    if (!group || !group.length) {
      throw new NotFoundException(`Group with ID ${groupId} not found`);
    }

    const event = await this.eventsRepository.getEventDetails(
      eventId,
      userId,
      groupId,
    );

    if (!event) {
      throw new NotFoundException(`Event not found`);
    }
    if (group[0].ownerId !== userId) {
      throw new ForbiddenException(
        'You are not authorized to delete this event',
      );
    }

    return this.eventsGroupRepository.deleteGroupEvent(eventId, groupId);
  }
}
