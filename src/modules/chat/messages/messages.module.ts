import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessagesRepository } from './messages.repository';
import { ConversationsService } from '../conversations/conversations.service';
import { ConversationsRepository } from '../conversations/conversations.repository';
@Module({
  providers: [
    MessagesService,
    MessagesRepository,
    ConversationsService,
    ConversationsRepository,
  ],
  exports: [MessagesService],
  controllers: [],
})
export class MessagesModule {}
