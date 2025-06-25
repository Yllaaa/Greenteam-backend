import { IsNotEmpty, IsString, IsUUID, MaxLength } from 'class-validator';

export class UpsertGroupNoteDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  content: string;
}
