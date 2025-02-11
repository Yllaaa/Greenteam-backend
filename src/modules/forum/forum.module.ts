import { Module } from '@nestjs/common';
import { ForumController } from './forum.controller';
import { ForumService } from './forum.service';
import { ForumRepository } from './forum.repository';

@Module({
  controllers: [ForumController],
  providers: [ForumService, ForumRepository],
})
export class ForumModule {}
