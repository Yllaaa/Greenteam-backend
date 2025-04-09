import { forwardRef, Module } from '@nestjs/common';
import { NotesController } from './notes.controller';
import { NotesService } from './notes.service';
import { NotesRepositry } from './notes.repository';
import { GroupMembersModule } from '../group-members/group-members.module';
import { GroupsModule } from '../groups.module';

@Module({
  imports: [GroupMembersModule, forwardRef(() => GroupsModule)],
  controllers: [NotesController],
  providers: [NotesService, NotesRepositry],
})
export class NotesModule {}
