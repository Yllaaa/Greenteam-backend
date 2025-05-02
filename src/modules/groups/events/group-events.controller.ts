import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { GroupEventsService } from './group-events.service';
import { CreateEventDto } from '../../events/events/dto/events.dto';
import { GetEventsDto } from 'src/modules/events/events/dto/getEvents.dto';
import { ValidatePosterInterceptor } from 'src/modules/common/upload-media/interceptors/validate-poster.interceptor';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('')
@UseGuards(JwtAuthGuard)
export class GroupEventsController {
  constructor(private readonly groupEventsService: GroupEventsService) {}

  @UseInterceptors(ValidatePosterInterceptor, FileInterceptor('poster'))
  @Post('/create-event')
  async createGroupEvent(
    @Param('groupId') groupId: string,
    @Body() eventData: CreateEventDto,
    @Req() req,
    @UploadedFile() poster: Express.Multer.File,
  ) {
    const groupMemberId = req.user.id;
    return this.groupEventsService.createGroupEvent(groupId, groupMemberId, {
      data: eventData,
      poster,
    });
  }

  @Get('')
  async getGroupEvents(
    @Param('groupId') groupId: string,
    @Query() queryParams: GetEventsDto,
    @Req() req,
  ) {
    const userId = req.user.id;
    return this.groupEventsService.getGroupEvents(
      groupId,
      {
        page: queryParams.page,
        limit: queryParams.limit,
      },
      userId,
    );
  }

  @Get('/:eventId')
  async getGroupEventDetails(
    @Param('groupId') groupId: string,
    @Param('eventId') eventId: string,
    @Req() req,
  ) {
    const userId = req.user.id;
    return this.groupEventsService.getGroupEventDetails(
      groupId,
      eventId,
      userId,
    );
  }

  @Delete('/:eventId')
  async deleteGroupEvent(
    @Param('groupId') groupId: string,
    @Param('eventId') eventId: string,
    @Req() req,
  ) {
    const userId = req.user.id;
    return this.groupEventsService.deleteGroupEvent(groupId, eventId, userId);
  }
}
