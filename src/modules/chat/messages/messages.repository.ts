import { Injectable } from '@nestjs/common';
import { DrizzleService } from 'src/modules/db/drizzle.service';
import { messages } from 'src/modules/db/schemas/chat/chat';
import { Sender } from '../chat/chat.gateway';
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
}
