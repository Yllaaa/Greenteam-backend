import { Injectable } from '@nestjs/common';
import { NotificationsGateway } from './notifications.gateway';

@Injectable()
export class NotificationSocketService {
  constructor(private readonly notificationsGateway: NotificationsGateway) {}

  async sendNotification(
    userId: string,
    notification: any,
    forceLanguage?: string,
  ) {
    if (!forceLanguage) {
      const userLanguage = this.notificationsGateway.getUserLanguage(userId);

      if (notification.messageEn && notification.messageEs) {
        notification.message =
          userLanguage === 'es'
            ? notification.messageEs
            : notification.messageEn;

        delete notification.messageEn;
        delete notification.messageEs;
      }
    }

    this.notificationsGateway.sendNotificationToUser(userId, notification);
  }
}
