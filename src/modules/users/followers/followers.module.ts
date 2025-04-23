import { Module } from '@nestjs/common';
import { FollowersService } from './followers.service';
import { FollowersRepository } from './followers.repository';

@Module({
  controllers: [],
  providers: [FollowersService, FollowersRepository],
  exports: [FollowersService, FollowersRepository],
})
export class FollowersModule {}
