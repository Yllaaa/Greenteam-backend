import { forwardRef, Module } from '@nestjs/common';
import { GroupsController } from './groups.controller';
import { GroupsRepository } from './groups.repository';
import { GroupsService } from './groups.service';
import { GroupMembersModule } from './group-members/group-members.module';
import { GroupPostsModule } from './posts/posts.module';
import { GroupEventsModule } from './events/group-events.module';
import { RouterModule } from '@nestjs/core';
import { NotesModule } from './notes/notes.module';
import path from 'path';

const groupRoutes = [
  { path: ':groupId/posts', module: GroupPostsModule },
  { path: ':groupId/members', module: GroupMembersModule },
  { path: ':groupId/events', module: GroupEventsModule },
  { path: ':groupId/notes', module: NotesModule },
];

@Module({
  controllers: [GroupsController],
  providers: [GroupsService, GroupsRepository],
  exports: [GroupsService, GroupsRepository],
  imports: [
    GroupMembersModule,
    GroupPostsModule,
    GroupEventsModule,
    RouterModule.register([
      { path: 'groups', module: GroupsModule, children: groupRoutes },
    ]),
    forwardRef(() => NotesModule),
  ],
})
export class GroupsModule {}
