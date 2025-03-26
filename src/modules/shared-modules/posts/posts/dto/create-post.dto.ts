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
import { CreatorType } from 'src/modules/db/schemas/schema';

export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsInt()
  @IsNotEmpty()
  mainTopicId: number;

  @IsEnum(['user', 'page', 'group_member'])
  creatorType: CreatorType;

  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  subtopicIds: number[];
}
