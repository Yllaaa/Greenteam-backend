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
import { UpsertGroupNoteDto } from './dto/upsert-note.dto';

@Controller('')
@UseGuards(JwtAuthGuard)
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Post('upsert-note')
  @RequireGroupMembership()
  async createNote(
    @Body() createNoteDto: UpsertGroupNoteDto,
    @Param('groupId') groupId: string,
    @Req() req,
  ) {
    const userId = req.user.id;
    return await this.notesService.upsertNote(createNoteDto, groupId, userId);
  }

  @Get('')
  @RequireGroupMembership()
  async getNoteById(@Param('groupId') groupId: string, @Req() req) {
    const userId = req.user.id;
    return this.notesService.getNoteByGroupId(groupId);
  }
}
