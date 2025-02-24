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
import { UseGuards, Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { verify } from 'jsonwebtoken';
import { WsJwtAuthGuard } from './guards/ws-jwt-auth.guard';
import { MessagesService } from '../messages/messages.service';
import { PresenceService } from '../presence/presence.service';
import { ConversationsService } from '../conversations/conversations.service';
import { SQL } from 'drizzle-orm';

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

interface SeenPayload {
  conversationId: string;
}

@WebSocketGateway({
  namespace: '/api/v1/chat',
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

  private async authenticateClient(client: Socket): Promise<Sender> {
    const authHeader = client.handshake?.headers?.authorization;
    if (!authHeader) {
      throw new WsException('No authorization header');
    }

    const token = authHeader.split(' ')[1];
    if (!process.env.JWT_SECRET) {
      throw new WsException('JWT configuration error');
    }

    const decoded: any = verify(token, process.env.JWT_SECRET);
    client.data.user = decoded;
    const pageId = client.handshake?.query?.pageId as string;
    return pageId
      ? { type: 'page' as unknown as SQL<'user' | 'page'>, id: pageId }
      : { type: 'user' as unknown as SQL<'user' | 'page'>, id: decoded.sub };
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

  @UseGuards(WsJwtAuthGuard)
  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: MessagePayload,
  ) {
    try {
      const sender = client.data.sender;
      let conversation;

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
        console.log('conversation', conversation);
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
      console.log('isParticipant', isParticipant);
      if (!isParticipant) {
        throw new WsException('Not a participant in this conversation');
      }

      const message = await this.messagesService.createMessage(
        conversation.id,
        sender,
        payload.content,
      );
      console.log('message', message);
      this.server.to(`conversation_${conversation.id}`).emit('newMessage', {
        ...message,
        sender,
        timestamp: new Date(),
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

  @UseGuards(WsJwtAuthGuard)
  @SubscribeMessage('typing')
  async handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { conversationId: string; isTyping: boolean },
  ) {
    const sender = client.data.sender;

    const isParticipant = await this.conversationsService.isParticipant(
      payload.conversationId,
      sender,
    );

    if (isParticipant) {
      this.server
        .to(`conversation_${payload.conversationId}`)
        .emit('userTyping', {
          conversationId: payload.conversationId,
          user: sender,
          isTyping: payload.isTyping,
        });
    }
  }
}
