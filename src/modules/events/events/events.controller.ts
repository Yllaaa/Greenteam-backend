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
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CreateEventDto } from './dto/createEvents.dto';
import { EventsService } from './events.service';
import { GetEventsDto } from '../events/dto/getEvents.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ValidatePosterInterceptor } from 'src/modules/common/upload-media/interceptors/validate-poster.interceptor';
import { AnyFilesInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { I18nService } from 'nestjs-i18n';

@UseGuards(JwtAuthGuard)
@Controller('')
export class EventsController {
  constructor(readonly eventsService: EventsService,
    private readonly i18n: I18nService

  ) { }

  @Post('create-event')
  @UseInterceptors(ValidatePosterInterceptor, FileInterceptor('poster'))
  async createEventFromUser(
    @Body() dto: CreateEventDto,
    @Request() req,
    @UploadedFile() poster: Express.Multer.File,
  ) {
    const userId = req.user.id;
    return this.eventsService.createEvent({ dto, poster }, userId);
  }

  @Get('')
  async getEvents(@Query() eventDto: GetEventsDto, @Req() req) {
    const userId = req.user.id;

    return await this.eventsService.getEvents(eventDto, userId);
  }

  @Get('/:id')
  async getEventDetail(@Param('id') id: string, @Req() req) {
    const userId = req.user.id;
    return await this.eventsService.getEventDetails(id, userId);
  }

  @Delete('/:id')
  async deleteEvent(@Param('id') id: string, @Req() req) {
    const userId = req.user.id;
    await this.eventsService.deleteEvent(id, userId);
    const translatedMessage = await this.i18n.t('pages.events.notifications.EVENT_DELETED');
    return { message: translatedMessage };
  }

  @Post('/:id/join')
  async joinEvent(@Param('id') id, @Req() req) {
    const userId = req.user.id;

    await this.eventsService.addUserJoinedEvent(id, userId);
    const translatedMessage = await this.i18n.t('events.events.validations.USER_JOINED');
    return { message: translatedMessage };
  }

  @Delete('/:id/leave')
  async leaveEvent(@Param('id') id, @Req() req) {
    const userId = req.user.id;

    await this.eventsService.removeUserJoinedEvent(id, userId);
    const translatedMessage = await this.i18n.t('events.events.validations.USER_LEFT_EVENT');
    return { message: translatedMessage };
  }
}
