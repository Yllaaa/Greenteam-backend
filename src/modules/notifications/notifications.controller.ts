import {
  Controller,
  Query,
  Get,
  Patch,
  Post,
  NotFoundException,
  Req,
  UseGuards,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { GetNotificationsDto } from './dto/get-notifications.to';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async getUserNotifications(
    @Query() pagination: GetNotificationsDto,
    @Req() req,
  ) {
    const userId = req.user.id;
    return this.notificationsService.getUserNotifications(userId, pagination);
  }

  @Patch('read-all')
  async markAllAsRead(@Req() req) {
    const userId = req.user.id;
    return this.notificationsService.markAllNotificationsAsRead(userId);
  }
}
