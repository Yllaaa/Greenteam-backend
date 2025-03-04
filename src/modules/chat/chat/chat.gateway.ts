import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WsException,
} from '@nestjs/websockets';
import { UseGuards, Logger, UseFilters } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { verify } from 'jsonwebtoken';
import { WsJwtAuthGuard } from './guards/ws-jwt-auth.guard';
import { MessagesService } from '../messages/messages.service';
import { PresenceService } from '../presence/presence.service';
import { ConversationsService } from '../conversations/conversations.service';
import { AuthService } from 'src/modules/auth/auth.service';
import { SQL } from 'drizzle-orm';
import { AllExceptionsSocketFilter } from '../filters/ws-exception.filter';

export type SenderType = SQL<'user' | 'page'>;

export interface Sender {
  type: SenderType;
  id: string;
}

export interface MessagePayload {
  conversationId?: string;
  content: string;
  recipient?: {
    id: string;
    type: SenderType;
  };
}

export interface MarkAsSeenPayload {
  conversationId: string;
}

@UseGuards(WsJwtAuthGuard)
@WebSocketGateway({
  namespace: '/api/v1/chat',
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true,
    allowedHeaders: ['authorization'],
  },
})
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(ChatGateway.name);
  private userSockets: Map<string, Set<string>> = new Map();

  constructor(
    private readonly messagesService: MessagesService,
    private readonly presenceService: PresenceService,
    private readonly conversationsService: ConversationsService,
    private readonly authService: AuthService,
  ) {}

  afterInit(server: Server) {
    this.logger.log('Direct messaging gateway initialized');
  }

  async handleConnection(client: Socket) {
    try {
      const sender = await this.authenticateClient(client);
      await this.setupClientConnection(client, sender);
    } catch (error) {
      this.logger.error(`Connection error: ${error.message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    try {
      const sender = client.data?.sender;
      if (!sender) return;

      if (sender.type === 'user') {
        const userSockets = this.userSockets.get(sender.id);
        userSockets?.delete(client.id);
        if (userSockets?.size === 0) {
          this.userSockets.delete(sender.id);
          this.presenceService.handleUserDisconnected(
            sender,
            client.id,
            this.server,
          );
        }
      }

      this.logger.log(`Client disconnected: ${client.id}`);
    } catch (error) {
      this.logger.error(`Disconnect error: ${error.message}`);
    }
  }

  async authenticateClient(client: Socket): Promise<Sender> {
    try {
      const authHeader = client.handshake?.headers?.authorization;
      const authQuery = client.handshake?.query?.token as string;
      const authAuth = client.handshake?.auth?.token;
      const token = authHeader?.startsWith('Bearer ')
        ? authHeader.split(' ')[1]
        : authQuery || authAuth;

      if (!token) {
        throw new WsException('No authentication token provided');
      }

      if (!process.env.JWT_SECRET) {
        throw new WsException('JWT configuration error');
      }

      const decoded = verify(token, process.env.JWT_SECRET) as { sub: string };
      if (!decoded?.sub) {
        throw new WsException('Invalid token');
      }

      const user = await this.authService.getUserById(decoded.sub);
      if (!user) {
        throw new WsException('User not found');
      }

      client.data.userFullData = user;

      const pageId = client.handshake?.query?.pageId as string;
      return pageId
        ? { type: 'page' as unknown as SQL<'user' | 'page'>, id: pageId }
        : { type: 'user' as unknown as SQL<'user' | 'page'>, id: decoded.sub };
    } catch (error) {
      console.error('WebSocket Auth Error:', error);
      throw new WsException('Authentication failed');
    }
  }

  private async setupClientConnection(client: Socket, sender: Sender) {
    client.data.sender = sender;

    if (sender.type === ('user' as unknown as SQL<'user' | 'page'>)) {
      if (!this.userSockets.has(sender.id)) {
        this.userSockets.set(sender.id, new Set());
      }
      this.userSockets.get(sender.id)?.add(client.id);

      await this.presenceService.handleUserConnected(
        sender,
        client.id,
        this.server,
      );

      const conversations =
        await this.conversationsService.getUserConversations(
          sender.id,
          sender.type,
        );
      conversations.forEach((conv) => {
        client.join(`conversation_${conv.id}`);
      });
    }

    this.logger.log(
      `Client connected: ${client.id} as ${sender.type} ${sender.id}`,
    );
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: MessagePayload,
  ) {
    try {
      const sender = client.data.sender;
      let conversation;
      if (!payload.content) {
        throw new WsException('message cannot be empty');
      }

      if (payload.conversationId) {
        conversation = await this.conversationsService.getConversation(
          payload.conversationId,
        );
        if (!conversation) {
          throw new WsException('Conversation not found');
        }
      } else {
        if (
          !payload.recipient ||
          !payload.recipient.id ||
          !payload.recipient.type
        ) {
          throw new WsException(
            'Recipient information is required for new conversations',
          );
        }

        conversation =
          await this.conversationsService.findConversationByParticipants(
            sender,
            payload.recipient,
          );
        if (!conversation) {
          conversation = await this.conversationsService.createConversation(
            sender,
            payload.recipient,
          );
        }
      }

      const isParticipant = await this.conversationsService.isParticipant(
        conversation.id,
        sender,
      );
      if (!isParticipant) {
        throw new WsException('Not a participant in this conversation');
      }

      const message = await this.messagesService.createMessage(
        conversation.id,
        sender,
        payload.content,
      );
      this.server.to(`conversation_${conversation.id}`).emit('newMessage', {
        ...message,
        isReceived: true,
        sender: {
          id: sender.id,
          name: client.data.userFullData.fullName,
          avatar: client.data.userFullData.avatar,
          username: client.data.userFullData.username,
        },
      });

      return {
        success: true,
        conversationId: conversation.id,
        messageId: message.id,
      };
    } catch (error) {
      this.logger.error(`Send message error: ${error.message}`);
      throw new WsException(error.message);
    }
  }
  @SubscribeMessage('markMessagesSeen')
  async handleMarkMessagesSeen(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: MarkAsSeenPayload,
  ) {
    try {
      const sender = client.data.sender;

      const conversation = await this.conversationsService.getConversation(
        payload.conversationId,
      );
      if (!conversation) {
        throw new WsException('Conversation not found');
      }

      const isParticipant = await this.conversationsService.isParticipant(
        conversation.id,
        sender,
      );
      if (!isParticipant) {
        throw new WsException('Not a participant in this conversation');
      }

      const updatedMessages = await this.messagesService.markMessagesAsSeen(
        conversation.id,
        sender.id,
      );

      if (updatedMessages.length > 0) {
        this.server.to(`conversation_${conversation.id}`).emit('messagesSeen', {
          conversationId: conversation.id,
          messageIds: updatedMessages.map((msg) => msg.id),
        });
      }

      return {
        success: true,
        count: updatedMessages.length,
      };
    } catch (error) {
      this.logger.error(`Mark messages seen error: ${error.message}`);
      throw new WsException(error.message);
    }
  }
}
