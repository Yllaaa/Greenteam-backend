import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UsersRepository } from './users.repository';
import { FriendsModule } from './friends/friends.module';

@Module({
  imports: [FriendsModule],
  providers: [UsersService, UsersRepository],
  controllers: [UsersController],
})
export class UsersModule { }
