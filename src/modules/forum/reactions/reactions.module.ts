import { Module } from '@nestjs/common';
import { ReactionsService } from './reactions.service';
import { ReactionsController } from './reactions.controller';
import { ReactionsModule } from 'src/modules/shared-modules/reactions/reactions.module';
import { ForumService } from '../publications/forum.service';
import { ForumRepository } from '../publications/forum.repository';

@Module({
  imports: [ReactionsModule],
  providers: [ReactionsService, ForumService, ForumRepository],
  controllers: [ReactionsController],
})
export class ForumReactionsModule {}
