import { Module } from '@nestjs/common';
import { GroupsController } from './groups.controller';
import { GroupsRepository } from './groups.repository';
import { GroupsService } from './groups.service';
import { GroupMembersModule } from './group-members/group-members.module';

@Module({
    controllers: [GroupsController],
    providers: [GroupsService, GroupsRepository],
    imports: [GroupMembersModule],
})
export class GroupsModule {}