import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { EventsDto } from '../events/dto/events.dto';
import { EventsService } from './events.service';
import { GetEventsDto } from '../events/dto/getEvents.dto';
import { Response } from 'express';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('events')
@UseGuards(JwtAuthGuard)
export class EventsController {
  constructor(readonly eventsService: EventsService) {}

  @Post('create-event')
  async createEventFromUser(@Body() event: EventsDto, @Request() req) {
    const userId = req.user.id;
    return this.eventsService.createEvent(event, userId);
  }

  @Get('')
  async getEvents(@Query() eventDto: GetEventsDto, @Req() req) {
    const userId = req.user.id;
    const pagination = {
      page: eventDto.page || 1,
      limit: eventDto.limit || 10,
    };
    return await this.eventsService.getEvents(
      pagination,
      eventDto.category,
      userId,
    );
  }

  @Get('/:id')
  async getEventDetail(@Param('id') id: string, @Req() req) {
    const userId = req.user.id;
    return await this.eventsService.getEventDetails(id, userId);
  }

  @Post('/:id/join')
  async joinEvent(@Param('id') id, @Req() req) {
    const userId = req.user.id;

    await this.eventsService.addUserJoinedEvent(id, userId);
    return { message: 'User joined event' };
  }

  @Delete('/:id/leave')
  async leaveEvent(@Param('id') id, @Req() req) {
    const userId = req.user.id;

    await this.eventsService.removeUserJoinedEvent(id, userId);
    return { message: 'User left event' };
  }
}
