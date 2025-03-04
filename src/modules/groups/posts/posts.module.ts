import { Module } from '@nestjs/common';
import { GroupPostsService } from './posts.service';
import { GroupsRepository } from '../groups.repository';
import { GroupMembersRepository } from '../group-members/group-members.repository';
import { PostsModule } from '../../shared-modules/posts/posts.module';
import { GroupPostsController } from './posts.controller';

@Module({
    controllers:[GroupPostsController],
    imports: [PostsModule], 
    providers: [GroupPostsService, GroupsRepository, GroupMembersRepository],
    exports: [GroupPostsService],
})
export class GroupPostsModule { }
