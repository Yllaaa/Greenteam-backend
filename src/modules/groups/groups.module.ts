import { Module } from '@nestjs/common';
import { GroupsController } from './groups.controller';
import { GroupsRepository } from './groups.repository';
import { GroupsService } from './groups.service';
import { GroupMembersModule } from './group-members/group-members.module';
import { GroupPostsModule } from './posts/posts.module';


@Module({
    controllers: [GroupsController],
    providers: [GroupsService, GroupsRepository],
    imports: [GroupMembersModule, GroupPostsModule],
})
export class GroupsModule {}