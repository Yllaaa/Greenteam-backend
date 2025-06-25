import { Injectable, Logger } from '@nestjs/common';
import { Server } from 'socket.io';
import { Sender } from '../chat/chat.gateway';
import { SQL } from 'drizzle-orm';
import { ConversationsService } from '../conversations/conversations.service';

@Injectable()
export class PresenceService {
  private readonly logger = new Logger(PresenceService.name);
  private onlineUsers: Map<string, Set<string>> = new Map();

  constructor(private readonly conversationsService: ConversationsService) {}

  getOnlineUsers(): string[] {
    return Array.from(this.onlineUsers.keys())
      .filter((key) => key.startsWith('user:'))
      .map((key) => key.replace('user:', ''));
  }

  isUserOnline(userId: string): boolean {
    const key = `user:${userId}`;
    return this.onlineUsers.has(key) && this.onlineUsers.get(key)!.size > 0;
  }

  async getOnlineConversationPartners(userId: string): Promise<string[]> {
    try {
      const conversations =
        await this.conversationsService.getUserConversations(
          userId,
          'user' as unknown as SQL<'user' | 'page'>,
        );

      const participantIds = new Set<string>();

      for (const conversation of conversations) {
        if (conversation.participantAId !== userId) {
          participantIds.add(conversation.participantAId);
        }

        if (conversation.participantBId !== userId) {
          participantIds.add(conversation.participantBId);
        }
      }

      return Array.from(participantIds).filter((participantId) =>
        this.isUserOnline(participantId),
      );
    } catch (error) {
      this.logger.error(
        `Error in getOnlineConversationPartners: ${error.message}`,
        error.stack,
      );
      return [];
    }
  }

  handleUserConnected(sender: Sender, socketId: string, server: Server): void {
    try {
      if (sender.type !== ('user' as unknown as SQL<'user' | 'page'>)) {
        return;
      }

      const key = `user:${sender.id}`;
      if (!this.onlineUsers.has(key)) {
        this.onlineUsers.set(key, new Set());
        server.emit('userOnline', {
          senderType: sender.type,
          senderId: sender.id,
        });
        this.logger.log(`User ${sender.id} is now online`);
      }

      this.onlineUsers.get(key)?.add(socketId);
    } catch (error) {
      this.logger.error(
        `Error in handleUserConnected: ${error.message}`,
        error.stack,
      );
    }
  }

  handleUserDisconnected(
    sender: Sender,
    socketId: string,
    server: Server,
  ): void {
    try {
      if (sender.type !== ('user' as unknown as SQL<'user' | 'page'>)) {
        return;
      }

      const key = `user:${sender.id}`;
      const sockets = this.onlineUsers.get(key);

      if (sockets) {
        sockets.delete(socketId);

        if (sockets.size === 0) {
          this.onlineUsers.delete(key);

          server.emit('userOffline', {
            senderType: sender.type,
            senderId: sender.id,
          });
          this.logger.log(`User ${sender.id} is now offline`);
        }
      }
    } catch (error) {
      this.logger.error(
        `Error in handleUserDisconnected: ${error.message}`,
        error.stack,
      );
    }
  }
}
