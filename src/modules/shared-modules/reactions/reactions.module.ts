import { Module } from '@nestjs/common';
import { ReactionsService } from './reactions.service';
import { ReactionsController } from './reactions.controller';
import { ReactionsRepository } from './reactions.repository';

@Module({
  providers: [ReactionsService, ReactionsRepository],
  exports: [ReactionsService, ReactionsRepository],
  controllers: [ReactionsController],
})
export class ReactionsModule {}
