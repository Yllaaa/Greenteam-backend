import { Body, Controller, Get, HttpStatus, NotImplementedException, Param, Post, Query, Req, Request, Res, UseGuards } from '@nestjs/common';
import { EventsDto } from './dto/events.dto';
import { EventsService } from './events.service';
import { GetEventsDto } from './dto/getEvents.dto';
import { IdParamDto } from './dto/id-param.dto';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('events')
@UseGuards(JwtAuthGuard)
export class EventsController {
    constructor(
        readonly eventsService: EventsService
    ) { }

    @Post('user')
    async createEventFromUser(@Body() event: EventsDto, @Request() req) {
        return this.eventsService.createEventFromUser(event, req.user)
    }

    @Post('page')
    async createEventFromPage(@Body() event: EventsDto, @Request() req) {
        throw new NotImplementedException();
    }

    @Get('')
    async getEvents(@Query() page: GetEventsDto) {
        page.pageNo = page.pageNo || 0
        if (page.category) {
            return await this.eventsService.getEventsByCategory(page.pageNo, page.category)
        }
        return await this.eventsService.getEvents(page.pageNo)
    }

    @Get(':id')
    async getEventDetail(@Param() idDto: IdParamDto) {
        return await this.eventsService.getEventDetails(idDto.id)
    }

    @Get(':id/join')
    async joinEvent(@Param() eventDto: IdParamDto, @Req() req, @Res() res: Response) {
        if (!(await this.eventsService.eventExist(eventDto.id))) {
            res.status(HttpStatus.NOT_FOUND).send()
            return
        }
        await this.eventsService.AddEventJoined(eventDto.id, req.user)
        res.status(HttpStatus.CREATED).send()
    }
}
