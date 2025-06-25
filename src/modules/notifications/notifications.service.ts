import {
  Injectable,
  HttpException,
  NotAcceptableException,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';

import { I18nContext, I18nService } from 'nestjs-i18n';
import { NotificationsRepository } from './notifications.repository';
import { GetNotificationsDto } from './dto/get-notifications.to';
import { InteractionType } from '../db/schemas/schema';
import { NotificationSocketService } from './notification-socket.service';
@Injectable()
export class NotificationsService {
  constructor(
    private readonly notificationsRepository: NotificationsRepository,
    private readonly notificationSocketService: NotificationSocketService,
    private readonly i18n: I18nService,
  ) {}

  async getUserNotifications(
    recipientId: string,
    pagination: GetNotificationsDto,
  ) {
    const notifications =
      await this.notificationsRepository.getUserNotifications(
        recipientId,
        pagination,
      );
    const lang = I18nContext.current()?.lang ?? 'en';

    return notifications.map((notification) => {
      return {
        id: notification.id,
        message:
          lang === 'en' ? notification.messageEn : notification.messageEs,
        isRead: notification.isRead,
        createdAt: notification.createdAt,
        metadata: notification.metadata,
        type: notification.type,
        actor: notification.actor,
      };
    });
  }

  async markAllNotificationsAsRead(recipientId: string) {
    return this.notificationsRepository.markAllAsRead(recipientId);
  }

  async createNotification(data: {
    recipientId: string;
    actorId: string;
    type: InteractionType;
    metadata: Record<string, any>;
    messageEn: string;
    messageEs: string;
    userLang?: string;
  }) {
    const {
      recipientId,
      actorId,
      type,
      metadata,
      messageEn,
      messageEs,
      userLang = 'en',
    } = data;

    const result = await this.notificationsRepository.createNotification(
      recipientId,
      actorId,
      type,
      metadata,
      messageEn,
      messageEs,
    );

    const message = userLang === 'es' ? messageEs : messageEn;

    const notification = {
      id: result[0].id,
      message,
      isRead: false,
      metadata,
      type,
      actor: { id: actorId },
      createdAt: result[0].createdAt,
    };

    await this.notificationSocketService.sendNotification(
      recipientId,
      notification,
    );

    return result;
  }
}
