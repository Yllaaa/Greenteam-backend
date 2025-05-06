import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  ConflictException,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { NotesRepositry } from './notes.repository';
import { CreateNoteDto } from './dto/create-note.dto';
import { GroupMembersService } from '../group-members/group-members.service';
import { GroupsService } from '../groups/groups.service';
import { UpsertGroupNoteDto } from './dto/upsert-note.dto';

@Injectable()
export class NotesService {
  constructor(
    private readonly notesRepository: NotesRepositry,
    private readonly groupMembersService: GroupMembersService,
    private readonly groupService: GroupsService,
  ) {}
  async upsertNote(dto: UpsertGroupNoteDto, groupId: string, userId: string) {
    const [group] = await this.groupService.getGroupById(groupId);
    if (group.ownerId !== userId) {
      throw new ForbiddenException('groups.notes.errors.UNAUTHORIZED_NOTED_ACTION');
    }
    return this.notesRepository.upsertGroupNote(dto, groupId, userId);
  }

  async getNoteByGroupId(groupId: string) {
    const note = await this.notesRepository.findByGroupId(groupId);
    if (!note) {
      throw new NotFoundException(`groups.notes.errors.NOTE_NOT_FOUND`);
    }
    return note;
  }
}
