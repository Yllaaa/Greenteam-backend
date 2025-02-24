import { Module } from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { ConversationsRepository } from './conversations.repository';
@Module({
  providers: [ConversationsService, ConversationsRepository],
  exports: [ConversationsService],
})
export class ConversationsModule {}
