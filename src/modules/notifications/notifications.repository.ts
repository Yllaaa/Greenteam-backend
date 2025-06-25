import { Injectable } from '@nestjs/common';
import { DrizzleService } from '../db/drizzle.service';
import { InteractionType, notifications } from '../db/schemas/schema';
import { eq, desc } from 'drizzle-orm';
@Injectable()
export class NotificationsRepository {
  constructor(private readonly drizzleService: DrizzleService) {}

  async getUserNotifications(
    recipientId: string,
    pagination: {
      page: number;
      limit: number;
    },
  ) {
    const { page, limit } = pagination;
    const offset = (page - 1) * limit;
    return this.drizzleService.db.query.notifications.findMany({
      columns: {
        id: true,
        recipientId: true,
        actorId: true,
        type: true,
        metadata: true,
        messageEn: true,
        messageEs: true,
        isRead: true,
        createdAt: true,
      },
      where: eq(notifications.recipientId, recipientId),
      orderBy: (notifications, { desc }) => [desc(notifications.createdAt)],
      limit: limit,
      offset: offset,
      with: {
        actor: {
          columns: {
            id: true,
            fullName: true,
            username: true,
            avatar: true,
          },
        },
      },
    });
  }

  async createNotification(
    recipientId: string,
    actorId: string,
    type: InteractionType,
    metadata: Record<string, any>,
    messageEn: string,
    messageEs: string,
  ) {
    return this.drizzleService.db
      .insert(notifications)
      .values({
        recipientId,
        actorId,
        type,
        metadata,
        messageEn,
        messageEs,
        isRead: false,
      })
      .returning();
  }

  async markAllAsRead(recipientId: string) {
    return this.drizzleService.db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.recipientId, recipientId))
      .returning();
  }
}
