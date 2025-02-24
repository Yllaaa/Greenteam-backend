import { Injectable } from '@nestjs/common';
import { MessagesRepository } from './messages.repository';
import { Sender } from '../chat/chat.gateway';
import { GetMessagesDto } from './dtos/get-messages.dto';
@Injectable()
export class MessagesService {
  constructor(private readonly messagesRepository: MessagesRepository) {}

  async createMessage(conversationId: string, sender: Sender, content: string) {
    return this.messagesRepository.createMessage(
      conversationId,
      sender,
      content,
    );
  }

  async getMessages(
    conversationId: string,
    cursor: GetMessagesDto['cursor'],
    limit: GetMessagesDto['limit'],
  ) {
    return this.messagesRepository.getMessagesPage(
      conversationId,
      cursor,
      limit,
    );
  }
}
