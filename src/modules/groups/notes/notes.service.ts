import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { NotesRepositry } from './notes.repository';
import { CreateNoteDto } from './dto/create-note.dto';
import { GroupMembersService } from '../group-members/group-members.service';
import { GroupsService } from '../groups/groups.service';

@Injectable()
export class NotesService {
  constructor(
    private readonly notesRepository: NotesRepositry,
    private readonly groupMembersService: GroupMembersService,
    private readonly groupService: GroupsService,
  ) {}
  async createNote(
    createNoteDto: CreateNoteDto,
    groupId: string,
    userId: string,
  ) {
    return this.notesRepository.create(createNoteDto, groupId, userId);
  }

  async getAllNotes(groupId: string, userId: string) {
    const notes = await this.notesRepository.findAll(groupId);

    return notes.map((note) => ({
      ...note,
      isCreator: note.creator.id === userId,
    }));
  }

  async getNoteById(id: string, userId: string) {
    const note = await this.notesRepository.findById(id);
    if (!note) {
      throw new NotFoundException(`Note not found`);
    }
    return { ...note, isCreator: note.creator.id === userId };
  }

  async deleteNote(id: string, groupId: string, userId: string) {
    const existingNote = await this.notesRepository.findById(id);
    if (!existingNote) {
      throw new NotFoundException(`Note not found`);
    }
    const [group] = await this.groupService.getGroupById(groupId);
    if (existingNote.creator.id !== userId && group.ownerId !== userId) {
      throw new UnauthorizedException(
        'You are not authorized to delete this note',
      );
    }
    await this.notesRepository.delete(id);
    return { message: 'Note deleted successfully' };
  }
}
