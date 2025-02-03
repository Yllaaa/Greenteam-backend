import {
  IsEnum,
  IsNotEmpty,
  IsString,
  IsUUID,
  IsArray,
  IsOptional,
} from 'class-validator';
import { SQL } from 'drizzle-orm';

export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsUUID()
  @IsNotEmpty()
  mainTopicId: string;

  @IsUUID()
  @IsOptional()
  creatorId: string;

  @IsEnum(['user', 'page', 'group_member'])
  creatorType: SQL<'user' | 'page' | 'group_member'>;

  @IsArray()
  @IsUUID('all', { each: true })
  subtopicIds: string[];
}
