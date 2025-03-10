import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { GroupEventsService } from './group-events.service';
import { EventsDto } from '../../events/dto/events.dto';
import { GetEventsDto } from 'src/modules/events/dto/getEvents.dto';

@Controller('groups/')
@UseGuards(JwtAuthGuard)
export class GroupEventsController {
  constructor(private readonly groupEventsService: GroupEventsService) { }

  @Post(':groupId/create-event')
  async createGroupEvent(
    @Param('groupId') groupId: string,
    @Body() eventData: EventsDto,
    @Request() req,
  ) {
    const groupMemberId = req.user.id;
    return this.groupEventsService.createGroupEvent(groupId, groupMemberId, eventData);
  }

  @Get(':groupId/events')
  async getGroupEvents(
    @Param('groupId') groupId: string,
    @Query() queryParams: GetEventsDto,
  ) {
    return this.groupEventsService.getGroupEvents(
      groupId,
      queryParams.category,
      queryParams.page,
      queryParams.limit,
    );
  }

  @Get(':groupId/:eventId')
  async getGroupEventDetails(
    @Param('groupId') groupId: string,
    @Param('eventId') eventId: string,
  ) {
    return this.groupEventsService.getGroupEventDetails(groupId, eventId);
  }

  @Post(':groupId/:eventId/join')
  async joinGroupEvent(
    @Param('groupId') groupId: string,
    @Param('eventId') eventId: string,
    @Request() req,
  ) {
    const userId = req.user.id;
    await this.groupEventsService.joinGroupEvent(groupId, eventId, userId);
    return { message: 'User joined event successfully' };
  }
}