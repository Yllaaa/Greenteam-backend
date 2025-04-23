import { Injectable } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { DrizzleService } from 'src/modules/db/drizzle.service';
import { groupNotes } from 'src/modules/db/schemas/schema';
import { CreateNoteDto } from './dto/create-note.dto';
import { GroupNote } from './interfaces/group-note.interface';
import { UpsertGroupNoteDto } from './dto/upsert-note.dto';
@Injectable()
export class NotesRepositry {
  constructor(private readonly drizzleService: DrizzleService) {}

  async findAll(groupId: string): Promise<GroupNote[]> {
    const notes = await this.drizzleService.db.query.groupNotes.findMany({
      columns: {
        id: true,
        title: true,
        content: true,
        createdAt: true,
      },
      where: eq(groupNotes.groupId, groupId),
      with: {
        creator: {
          columns: { id: true, fullName: true },
        },
      },
    });
    return notes as GroupNote[];
  }

  async findById(id: string): Promise<GroupNote> {
    const note = await this.drizzleService.db.query.groupNotes.findFirst({
      columns: {
        id: true,
        title: true,
        content: true,
        createdAt: true,
      },
      where: eq(groupNotes.id, id),
      with: {
        creator: {
          columns: { id: true, fullName: true },
        },
      },
    });
    return note as GroupNote;
  }

  async findByGroupId(groupId: string): Promise<GroupNote> {
    const notes = await this.drizzleService.db.query.groupNotes.findFirst({
      columns: {
        id: true,
        title: true,
        content: true,
        createdAt: true,
      },
      where: eq(groupNotes.groupId, groupId),
      with: {
        creator: {
          columns: { id: true, fullName: true },
        },
      },
    });
    return notes as GroupNote;
  }

  async upsertGroupNote(
    dto: UpsertGroupNoteDto,
    groupId: string,
    userId: string,
  ) {
    const [note] = await this.drizzleService.db
      .insert(groupNotes)
      .values({
        groupId,
        creatorId: userId,
        title: dto.title,
        content: dto.content,
      })
      .onConflictDoUpdate({
        target: groupNotes.groupId,
        set: {
          title: dto.title,
          content: dto.content,
          updatedAt: new Date(),
        },
      })
      .returning({
        title: groupNotes.title,
        content: groupNotes.content,
      });
    return note;
  }

  async create(data: CreateNoteDto, groupId: string, creatorId: string) {
    const { title, content } = data;

    const result = await this.drizzleService.db
      .insert(groupNotes)
      .values({
        groupId,
        creatorId,
        title,
        content,
      })
      .returning();

    return result[0];
  }

  async delete(id: string) {
    const result = await this.drizzleService.db
      .delete(groupNotes)
      .where(eq(groupNotes.id, id))
      .returning();

    return result[0];
  }
}
