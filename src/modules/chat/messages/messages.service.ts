import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { MessagesRepository } from './messages.repository';
import { Sender } from '../chat/chat.gateway';
import { GetMessagesDto } from './dtos/get-messages.dto';
import { ConversationsService } from '../conversations/conversations.service';
@Injectable()
export class MessagesService {
  constructor(
    private readonly messagesRepository: MessagesRepository,
    private readonly conversationsService: ConversationsService,
  ) {}

  async createMessage(
    conversationId: string,
    participant: Sender,
    content: string,
  ) {
    return this.messagesRepository.createMessage(
      conversationId,
      participant,
      content,
    );
  }

  async getMessages(
    conversationId: string,
    participant: Sender,
    cursor: GetMessagesDto['cursor'],
    limit: GetMessagesDto['limit'],
  ) {
    const conversation =
      await this.conversationsService.getConversation(conversationId);
    if (!conversation) {
      throw new HttpException('chat.chat.errors.NOT_FOUND', HttpStatus.NOT_FOUND);
    }

    const isParticipant = await this.conversationsService.isParticipant(
      conversationId,
      participant,
    );
    if (!isParticipant) {
      throw new HttpException('chat.chat.errors.FORBIDDEN', HttpStatus.FORBIDDEN);
    }

    const messages = await this.messagesRepository.getMessagesPage(
      conversationId,
      cursor,
      limit,
    );
    const formattedMessages = this.formatMessages(messages, participant.id);
    return formattedMessages;
  }

  async markMessagesAsSeen(conversationId: string, participantsId: string) {
    return await this.messagesRepository.markMessagesAsSeen(
      conversationId,
      participantsId,
    );
  }

  formatMessages(messages: Message[], participantId: string) {
    return messages.map((message) => {
      const isSentByParticipant = message.senderId === participantId;

      let senderInfo: {
        id: string;
        name: string;
        avatar: string | null;
        username: string;
      } | null = null;
      if (message.senderType === 'user' && message.senderUser) {
        senderInfo = {
          id: message.senderUser.id,
          name: message.senderUser.fullName,
          avatar: message.senderUser.avatar,
          username: message.senderUser.username,
        };
      } else if (message.senderType === 'page' && message.senderPage) {
        senderInfo = {
          id: message.senderPage.id,
          name: message.senderPage.name,
          avatar: message.senderPage.avatar,
          username: message.senderPage.username,
        };
      }

      return {
        id: message.id,
        conversationId: message.conversationId,
        senderType: message.senderType,
        content: message.content,
        mediaUrl: message.mediaUrl,
        sentAt: message.sentAt,
        seenAt: message.seenAt,
        isReceived: !isSentByParticipant,
        sender: senderInfo,
      };
    });
  }
}
