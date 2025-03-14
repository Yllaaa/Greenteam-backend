import { IsNotEmpty, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateReplyDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  content: string;
}
