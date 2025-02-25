import { Injectable } from '@nestjs/common';
import { DrizzleService } from 'src/modules/db/drizzle.service';
import { messages } from 'src/modules/db/schemas/chat/chat';
import { Sender } from '../chat/chat.gateway';
import { and, or, eq, gt, asc } from 'drizzle-orm';
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
      .returning();
    return message;
  }

  async getMessagesPage(
    conversationId: string,
    cursor?: GetMessagesDto['cursor'],
    limit = 10,
  ): Promise<Message[]> {
    const messages = await this.drizzleService.db.query.messages.findMany({
      where: cursor
        ? (messages, { and, eq, gt, or }) =>
            and(
              eq(messages.conversationId, conversationId),
              or(
                gt(messages.sentAt, cursor.sentAt),
                and(
                  eq(messages.sentAt, cursor.sentAt),
                  gt(messages.id, cursor.id),
                ),
              ),
            )
        : (messages, { eq }) => eq(messages.conversationId, conversationId),
      limit,
      orderBy: (messages, { asc }) => [asc(messages.sentAt), asc(messages.id)],
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
}
