import {
  IsEnum,
  IsNotEmpty,
  IsString,
  IsUUID,
  IsArray,
  IsOptional,
  IsInt,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreatorType } from 'src/modules/db/schemas/schema';

export class CreateGroupPostDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  mainTopicId: number;

  @IsOptional()
  @IsArray()
  @Type(() => Number)
  @IsInt({ each: true })
  subtopicIds: number[];
}
