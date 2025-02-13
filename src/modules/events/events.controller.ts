import {
  Body,
  Controller,
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
import { EventsDto } from './dto/events.dto';
import { EventsService } from './events.service';
import { GetEventsDto } from './dto/getEvents.dto';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

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
  async getEvents(@Query() eventDto: GetEventsDto) {
    return await this.eventsService.getEvents(
      eventDto.category,
      eventDto.page,
      eventDto.limit,
    );
  }

  @Get('/:id')
  async getEventDetail(@Param('id') id: string) {
    return await this.eventsService.getEventDetails(id);
  }

  @Post('/:id/join')
  async joinEvent(@Param('id') id, @Req() req) {
    const userId = req.user.id;

    await this.eventsService.addUserJoinedEvent(id, userId);
    return { message: 'User joined event' };
  }
}
