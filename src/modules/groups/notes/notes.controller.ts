import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { RequireGroupMembership } from 'src/modules/groups/decorators/group-member.decorator';

@Controller('')
@UseGuards(JwtAuthGuard)
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Post('create-note')
  @RequireGroupMembership()
  async createNote(
    @Body() createNoteDto: CreateNoteDto,
    @Param('groupId') groupId: string,
    @Req() req,
  ) {
    const userId = req.user.id;
    return this.notesService.createNote(createNoteDto, groupId, userId);
  }

  @Get()
  @RequireGroupMembership()
  async getAllNotes(@Param('groupId') groupId: string, @Req() req) {
    const userId = req.user.id;
    return this.notesService.getAllNotes(groupId, userId);
  }

  @Get(':id')
  @RequireGroupMembership()
  async getNoteById(
    @Param('id') id: string,
    @Param('groupId') groupId: string,
    @Req() req,
  ) {
    const userId = req.user.id;
    return this.notesService.getNoteById(id, userId);
  }

  @Delete(':id/delete-note')
  async deleteNote(
    @Param('id') id: string,
    @Param('groupId') groupId: string,
    @Req() req,
  ) {
    const userId = req.user.id;
    return this.notesService.deleteNote(id, groupId, userId);
  }
}
