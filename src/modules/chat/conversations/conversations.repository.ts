import { Injectable } from '@nestjs/common';
import { and, desc, eq, ne, or, sql, SQL } from 'drizzle-orm';
import { DrizzleService } from 'src/modules/db/drizzle.service';
import { conversations, messages } from 'src/modules/db/schemas/chat/chat';
import { users } from 'src/modules/db/schemas/schema';
import { Sender } from '../chat/chat.gateway';
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

  async listUserConversations(
    participantId: string,
    participantType: SQL<'user' | 'page'>,
    pagination: { page: number; limit: number },
  ): Promise<Conversation[]> {
    const { page, limit } = pagination;
    const offset = (page - 1) * limit;

    const conversationsList =
      await this.drizzleService.db.query.conversations.findMany({
        offset,
        limit,
        columns: {
          id: true,
        },
        extras: {
          unreadCount: sql<number>`
          COALESCE((
            SELECT COUNT(m.*)::integer
            FROM chat_messages m
            WHERE m.conversation_id = ${conversations.id}
            AND m.sender_id != ${participantId}
            AND m.seen_at IS NULL
            AND m.id IN (
              SELECT id 
              FROM chat_messages 
              WHERE conversation_id = ${conversations.id}
              ORDER BY sent_at DESC
              LIMIT 10
            )
          ), 0)
        `.as('unread_count'),
        },
        where: or(
          and(
            eq(conversations.participantAId, participantId),
            eq(conversations.participantAType, participantType),
          ),
          and(
            eq(conversations.participantBId, participantId),
            eq(conversations.participantBType, participantType),
          ),
        ),
        with: {
          ...(participantType === ('user' as unknown as SQL<'user' | 'page'>)
            ? {
                participantAUser: {
                  columns: {
                    id: true,
                    fullName: true,
                    username: true,
                    avatar: true,
                  },
                  where: ne(users.id, participantId),
                },
                participantBUser: {
                  columns: {
                    id: true,
                    fullName: true,
                    username: true,
                    avatar: true,
                  },
                  where: ne(users.id, participantId),
                },
              }
            : {
                participantAPage: {
                  columns: {
                    id: true,
                    name: true,
                    avatar: true,
                  },
                },
                participantBPage: {
                  columns: {
                    id: true,
                    name: true,
                    avatar: true,
                  },
                },
              }),
          messages: {
            columns: {
              id: true,
              content: true,
              sentAt: true,
            },
            limit: 1,
            orderBy: [desc(messages.sentAt)],
          },
        },
        orderBy: (conversations) => [
          desc(sql<Date>`(
        SELECT sent_at
        FROM chat_messages
        WHERE conversation_id = ${conversations.id}
        ORDER BY sent_at DESC
        LIMIT 1
      )`),
        ],
      });
    return conversationsList as unknown as Conversation[];
  }

  async getUserConversations(
    participantId: string,
    participantType: SQL<'user' | 'page'>,
  ) {
    return await this.drizzleService.db.query.conversations.findMany({
      columns: {
        id: true,
      },
      where: or(
        and(
          eq(conversations.participantAId, participantId),
          eq(conversations.participantAType, participantType),
        ),
        and(
          eq(conversations.participantBId, participantId),
          eq(conversations.participantBType, participantType),
        ),
      ),
    });
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
