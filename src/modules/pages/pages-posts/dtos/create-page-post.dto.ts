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

export class CreatePagePostDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsEnum(['user', 'page', 'group_member'], {
    message: 'creatorType must be one of: user, page, group_member',
  })
  creatorType: CreatorType;

  @IsArray()
  @Type(() => Number)
  @IsInt({ each: true })
  subtopicIds: number[];
}
