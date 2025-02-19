import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UsersRepository } from './users.repository';
import { FriendsModule } from './friends/friends.module';
import { RouterModule } from '@nestjs/core';

@Module({
  imports: [
    FriendsModule,
    RouterModule.register([{ path: '/user', module: FriendsModule }])
  ],
  providers: [UsersService, UsersRepository],
  controllers: [UsersController],
})
export class UsersModule { }
