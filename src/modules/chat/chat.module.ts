import { Module } from '@nestjs/common';
import { ConversationsModule } from './conversations/conversations.module';
import { MessagesModule } from './messages/messages.module';
import { PresenceModule } from './presence/presence.module';
import { ChatGateway } from './chat/chat.gateway';

@Module({
  imports: [ConversationsModule, MessagesModule, PresenceModule],
  providers: [ChatGateway],
})
export class ChatModule {}
