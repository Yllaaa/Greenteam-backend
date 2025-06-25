import { Injectable } from '@nestjs/common';
import { DrizzleService } from 'src/modules/db/drizzle.service';
import { messages } from 'src/modules/db/schemas/chat/chat';
import { Sender } from '../chat/chat.gateway';
import { and, or, eq, gt, asc, isNull, sql, desc, lt } from 'drizzle-orm';
import { GetMessagesDto } from './dtos/get-messages.dto';
@Injectable()
export class MessagesRepository {
  constructor(private readonly drizzleService: DrizzleService) {}

  async createMessage(conversationId: string, sender: Sender, content: string) {
    const [message] = await this.drizzleService.db
      .insert(messages)
      .values({
        conversationId,
        senderId: sender.id,
        senderType: sender.type,
        content,
      })
      .returning({
        id: messages.id,
        conversationId: messages.conversationId,
        senderType: messages.senderType,
        senderId: messages.senderId,
        content: messages.content,
        mediaUrl: messages.mediaUrl,
        sentAt: messages.sentAt,
        seenAt: messages.seenAt,
      });
    return message;
  }

  async getMessagesPage(
    conversationId: string,
    cursor?: GetMessagesDto['cursor'],
    limit = 10,
  ): Promise<Message[]> {
    const messages = await this.drizzleService.db.query.messages.findMany({
      where: (messages, { and, eq, lt }) =>
        cursor
          ? and(
              eq(messages.conversationId, conversationId),
              or(
                lt(messages.sentAt, cursor.sentAt),
                and(
                  eq(messages.sentAt, cursor.sentAt),
                  lt(messages.id, cursor.id),
                ),
              ),
            )
          : eq(messages.conversationId, conversationId),
      limit,
      orderBy: (messages, { desc }) => [
        desc(messages.sentAt),
        desc(messages.id),
      ],
      with: {
        senderUser: {
          columns: {
            id: true,
            fullName: true,
            avatar: true,
            username: true,
          },
        },
        senderPage: {
          columns: {
            id: true,
            name: true,
            avatar: true,
            username: true,
          },
        },
      },
    });
    return messages as unknown as Message[];
  }

  async markMessagesAsSeen(conversationId: string, userId: string) {
    const now = new Date();
    await this.drizzleService.db
      .update(messages)
      .set({ seenAt: now })
      .where(
        and(
          eq(messages.conversationId, conversationId),
          isNull(messages.seenAt),
          sql`(${messages.senderType} != 'user' OR ${messages.senderId} != ${userId})`,
        ),
      );
    const formattedDate = now.toISOString();
    return await this.drizzleService.db
      .select()
      .from(messages)
      .where(
        and(
          eq(messages.conversationId, conversationId),
          sql`${messages.seenAt}::timestamp::date = ${now}::timestamp::date`,
        ),
      );
  }
}
