import { Module } from '@nestjs/common';
import { ConversationsModule } from './conversations/conversations.module';
import { MessagesModule } from './messages/messages.module';
import { PresenceModule } from './presence/presence.module';
import { ChatGateway } from './chat/chat.gateway';
import { RouterModule } from '@nestjs/core';
import { AuthModule } from '../auth/auth.module';

const chatRoutes = [{ path: '/conversations', module: ConversationsModule }];

@Module({
  imports: [
    AuthModule,
    ConversationsModule,
    MessagesModule,
    PresenceModule,
    RouterModule.register([
      { path: 'chat', module: ChatModule, children: chatRoutes },
    ]),
  ],
  providers: [ChatGateway],
})
export class ChatModule {}
