import { Module } from '@nestjs/common';
import { PresenceService } from './presence.service';
import { ConversationsModule } from '../conversations/conversations.module';

@Module({
  providers: [PresenceService],
  imports: [ConversationsModule],
  exports: [PresenceService],
})
export class PresenceModule {}
