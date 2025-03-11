import { Module } from '@nestjs/common';
import { ReactionsController } from './reactions.controller';
import { ReactionsService } from './reactions.service';
import { ReactionsModule } from 'src/modules/shared-modules/reactions/reactions.module';

@Module({
  imports: [ReactionsModule],
  controllers: [ReactionsController],
  providers: [ReactionsService],
})
export class EventCommentsReactionsModule {}
