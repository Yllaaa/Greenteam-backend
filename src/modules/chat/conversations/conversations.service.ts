import { Injectable } from '@nestjs/common';
import { ConversationsRepository } from './conversations.repository';
import { SQL } from 'drizzle-orm';
import { Sender } from '../chat/chat.gateway';
@Injectable()
export class ConversationsService {
  constructor(
    private readonly conversationsRepository: ConversationsRepository,
  ) {}

  async getConversation(conversationId: string) {
    return this.conversationsRepository.findConversationById(conversationId);
  }

  async listUserConversations(
    participantId: string,
    participantType: SQL<'user' | 'page'>,
    pagination: { page: number; limit: number },
  ) {
    const conversations =
      await this.conversationsRepository.listUserConversations(
        participantId,
        participantType,
        pagination,
      );
    const formattedConversations = this.transformConversations(conversations);
    return formattedConversations;
  }

  async getUserConversations(
    participantId: string,
    participantType: SQL<'user' | 'page'>,
  ) {
    return this.conversationsRepository.getUserConversations(
      participantId,
      participantType,
    );
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

  private transformConversations(rawConversations: any[]): Conversation[] {
    const conversations = rawConversations
      .map((conv) => {
        let contact: Contact | null = null;

        if (conv.participantAUser || conv.participantBUser) {
          const user = conv.participantAUser ?? conv.participantBUser;
          contact = {
            id: user.id,
            fullName: user.fullName,
            username: user.username,
            avatar: user.avatar ?? null,
            type: 'user',
          };
        } else if (conv.participantAPage || conv.participantBPage) {
          const page = conv.participantAPage ?? conv.participantBPage;
          contact = {
            id: page.id,
            name: page.name,
            avatar: page.avatar ?? null,
            type: 'page',
          };
        }

        if (!contact) return null;

        return {
          id: conv.id,
          contactType: contact.type,
          contact,
          lastMessage: conv.messages.length > 0 ? conv.messages[0] : undefined,
          unreadCount: conv.unreadCount,
        };
      })
      .filter(Boolean);
    return conversations as Conversation[];
  }
}
