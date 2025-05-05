import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { NotificationsRepository } from './notifications.repository';
import { NotificationsGateway } from './notifications.gateway';
import { NotificationSocketService } from './notification-socket.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    NotificationsRepository,
    NotificationsGateway,
    NotificationSocketService,
  ],
  exports: [
    NotificationsService,
    NotificationsRepository,
    NotificationSocketService,
  ],
})
export class NotificationsModule {}
