import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UsersRepository } from './users.repository';
import { FriendsModule } from './friends/friends.module';
import { RouterModule } from '@nestjs/core';
import { ScoreModule } from './score/score.module';
import { ProfileModule } from './profile/profile.module';
import { FavouritesModule } from './favourites/favourites.module';

const usersRoutes = [
  { path: 'friends', module: FriendsModule },
  { path: 'score', module: ScoreModule },
  { path: 'profile', module: ProfileModule },
];
@Module({
  imports: [
    FriendsModule,
    RouterModule.register([
      { path: '/users', module: FriendsModule, children: usersRoutes },
    ]),
    ScoreModule,
    ProfileModule,
    FavouritesModule,
  ],
  providers: [UsersService, UsersRepository],
  exports: [UsersService, UsersRepository],
  controllers: [UsersController],
})
export class UsersModule {}
