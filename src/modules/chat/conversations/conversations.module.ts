import { Module } from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { ConversationsRepository } from './conversations.repository';
import { ConversationsController } from './conversations.controller';
import { MessagesModule } from '../messages/messages.module';

@Module({
  providers: [ConversationsService, ConversationsRepository],
  exports: [ConversationsService],
  imports: [MessagesModule],
  controllers: [ConversationsController],
})
export class ConversationsModule {}
