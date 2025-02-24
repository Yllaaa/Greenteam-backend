import { Injectable } from '@nestjs/common';
import { MessagesRepository } from './messages.repository';
import { Sender } from '../chat/chat.gateway';
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
}
