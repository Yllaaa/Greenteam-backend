import { Injectable } from '@nestjs/common';
import { ConversationsRepository } from './conversations.repository';
import { Sender } from '../presence/presence.service';
@Injectable()
export class ConversationsService {
  constructor(
    private readonly conversationsRepository: ConversationsRepository,
  ) {}

  async getConversation(conversationId: string) {
    return this.conversationsRepository.findConversationById(conversationId);
  }

  async getUserConversations(userId: string) {
    return this.conversationsRepository.getUserConversations(userId);
  }

  async isParticipant(
    conversationId: string,
    sender: Sender,
  ): Promise<boolean> {
    return Boolean(
      await this.conversationsRepository.getConversationByParticipantId(
        conversationId,
        sender.id,
      ),
    );
  }

  async createConversation(participantA: Sender, participantB: Sender) {
    return this.conversationsRepository.createConversation(
      participantA,
      participantB,
    );
  }

  async findConversationByParticipants(
    participantA: Sender,
    participantB: Sender,
  ) {
    return this.conversationsRepository.findConversationByParticipants(
      participantA,
      participantB,
    );
  }
}
