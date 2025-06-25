import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { UsersService } from '../users/users.service';
import { verify } from 'jsonwebtoken';

@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true,
    allowedHeaders: ['authorization'],
  },
  namespace: '/api/v1/notifications',
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);
  private userSocketMap = new Map<string, string[]>();
  private userLanguageMap = new Map<string, string>();

  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  private async authenticateClient(client: Socket): Promise<{ id: string }> {
    try {
      const authHeader = client.handshake?.headers?.authorization;
      const authQuery = client.handshake?.query?.token as string;
      const authAuth = client.handshake?.auth?.token;
      console.log('Auth Header:', authHeader);
      const token = authHeader?.startsWith('Bearer ')
        ? authHeader.split(' ')[1]
        : authQuery || authAuth;

      if (!token) {
        throw new WsException('No authentication token provided');
      }

      const secret = process.env.JWT_SECRET;
      if (!secret) {
        throw new WsException('JWT secret not configured');
      }

      const decoded = verify(token, secret) as { sub: string };
      if (!decoded?.sub) {
        throw new WsException('Invalid token');
      }

      const user = await this.authService.getUserById(decoded.sub);
      if (!user) {
        throw new WsException('User not found');
      }

      client.data.userFullData = user;

      return { id: decoded.sub };
    } catch (error) {
      this.logger.error(`WebSocket Auth Error: ${error.message}`);
      throw new WsException('Authentication failed');
    }
  }

  async handleConnection(client: Socket) {
    try {
      const { id: userId } = await this.authenticateClient(client);

      let language = (client.handshake.query.lang as string) || null;

      if (!language) {
        try {
          const user = await this.usersService.getUserById(userId);
          language = user?.languagePreference || 'en';
        } catch {
          language = 'en';
        }
      }

      this.userLanguageMap.set(userId, language);
      client.data.userId = userId;
      client.data.language = language;

      const sockets = this.userSocketMap.get(userId) || [];
      sockets.push(client.id);
      this.userSocketMap.set(userId, sockets);

      this.logger.log(
        `Client connected: ${client.id} for user: ${userId} with language: ${language}`,
      );

      client.join(userId);
    } catch (error) {
      this.logger.warn(`Connection refused for client ${client.id}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data.userId;

    if (userId) {
      const updatedSockets = (this.userSocketMap.get(userId) || []).filter(
        (id) => id !== client.id,
      );

      if (updatedSockets.length) {
        this.userSocketMap.set(userId, updatedSockets);
      } else {
        this.userSocketMap.delete(userId);
        this.userLanguageMap.delete(userId);
      }
    }

    this.logger.log(`Client disconnected: ${client.id}`);
  }

  sendNotificationToUser(userId: string, notification: any) {
    this.logger.log(`Emitting notification to user: ${userId}`);
    this.server.to(userId).emit('notification', notification);
  }

  getUserLanguage(userId: string): string {
    return this.userLanguageMap.get(userId) || 'en';
  }

  @SubscribeMessage('setLanguage')
  handleSetLanguage(client: Socket, language: string) {
    const userId = client.data.userId;
    if (!userId) return false;

    client.data.language = language;
    this.userLanguageMap.set(userId, language);

    this.logger.log(
      `Updated language preference for user ${userId} to ${language}`,
    );
    return true;
  }
}
