import {
  IsEnum,
  IsNotEmpty,
  IsString,
  IsUUID,
  IsArray,
  IsOptional,
  IsInt,
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
  @IsInt({ each: true })
  subtopicIds: number[];
}
