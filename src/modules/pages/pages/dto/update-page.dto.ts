import { Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';
import { PageCategoryType } from 'src/modules/db/schemas/schema';
enum PageCategoryEnum {
  Business = 'Business',
  Project = 'Project',
}
export class UpdatePageDto {
  @IsOptional()
  @IsString()
  @Type(() => String)
  name: string;

  @IsOptional()
  @IsString()
  @Type(() => String)
  @IsOptional()
  description: string;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  topicId: number;

  @IsOptional()
  @IsString()
  @IsOptional()
  @Type(() => String)
  websiteUrl: string;

  @IsOptional()
  @IsIn(Object.values(PageCategoryEnum), {
    message: `Invalid category. Must be one of: ${Object.values(PageCategoryEnum).join(', ')}`,
  })
  category: PageCategoryType;

  @IsOptional()
  @IsString()
  @IsOptional()
  @Type(() => String)
  why: string;

  @IsString()
  @IsOptional()
  @Type(() => String)
  how: string;

  @IsString()
  @IsOptional()
  @Type(() => String)
  what: string;
}
