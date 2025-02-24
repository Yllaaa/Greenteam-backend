import { Injectable } from '@nestjs/common';
import { and, eq, or } from 'drizzle-orm';
import { DrizzleService } from 'src/modules/db/drizzle.service';
import { conversations } from 'src/modules/db/schemas/chat/chat';
import { Sender } from '../presence/presence.service';
@Injectable()
export class ConversationsRepository {
  constructor(private readonly drizzleService: DrizzleService) {}

  async findConversationById(conversationId: string) {
    const conversation =
      await this.drizzleService.db.query.conversations.findFirst({
        where: eq(conversations.id, conversationId),
        columns: {
          id: true,
          participantAId: true,
          participantAType: true,
          participantBId: true,
          participantBType: true,
        },
      });

    return conversation;
  }

  async getUserConversations(userId: string) {
    const userConversations = await this.drizzleService.db
      .select()
      .from(conversations)
      .where(
        or(
          and(
            eq(conversations.participantAId, userId),
            eq(conversations.participantAType, 'user'),
          ),
          and(
            eq(conversations.participantBId, userId),
            eq(conversations.participantBType, 'user'),
          ),
        ),
      );

    return userConversations;
  }

  async getConversationByParticipantId(conversationId: string, userId: string) {
    return this.drizzleService.db.query.conversations.findFirst({
      where: or(
        and(
          eq(conversations.id, conversationId),
          eq(conversations.participantAId, userId),
          eq(conversations.participantAType, 'user'),
        ),
        and(
          eq(conversations.id, conversationId),
          eq(conversations.participantBId, userId),
          eq(conversations.participantBType, 'user'),
        ),
      ),
    });
  }

  async findConversationByParticipants(sender: Sender, recipient: Sender) {
    return this.drizzleService.db.query.conversations.findFirst({
      where: or(
        and(
          eq(conversations.participantAId, sender.id),
          eq(conversations.participantAType, sender.type),
          eq(conversations.participantBId, recipient.id),
          eq(conversations.participantBType, recipient.type),
        ),
        and(
          eq(conversations.participantAId, recipient.id),
          eq(conversations.participantAType, recipient.type),
          eq(conversations.participantBId, sender.id),
          eq(conversations.participantBType, sender.type),
        ),
      ),
    });
  }

  async createConversation(sender: Sender, recipient: Sender) {
    const [newConversation] = await this.drizzleService.db
      .insert(conversations)
      .values({
        participantAId: sender.id,
        participantAType: sender.type,
        participantBId: recipient.id,
        participantBType: recipient.type,
      })
      .returning();
    return newConversation;
  }
}
