import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UsersRepository } from './users.repository';
import { RouterModule } from '@nestjs/core';
import { ScoreModule } from './score/score.module';
import { ProfileModule } from './profile/profile.module';
import { FavoritesModule } from './favorites/favorites.module';
import { ActionsModule } from './actions/actions.module';

const usersRoutes = [
  { path: 'score', module: ScoreModule },
  { path: '/', module: ProfileModule },
  { path: 'favorites', module: FavoritesModule },
];
@Module({
  imports: [
    RouterModule.register([
      { path: '/users', module: UsersModule, children: usersRoutes },
    ]),
    ScoreModule,
    ProfileModule,
    FavoritesModule,
    ActionsModule,
  ],
  providers: [UsersService, UsersRepository],
  exports: [UsersService, UsersRepository],
  controllers: [UsersController],
})
export class UsersModule {}
