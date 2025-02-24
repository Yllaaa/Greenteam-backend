import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessagesRepository } from './messages.repository';
@Module({
  providers: [MessagesService, MessagesRepository],
  exports: [MessagesService],
  controllers: [],
})
export class MessagesModule {}
