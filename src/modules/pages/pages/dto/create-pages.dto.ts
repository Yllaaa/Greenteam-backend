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
export class CreatePageDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsString()
  @Length(3, 50, { message: 'Slug must be between 3 and 50 characters long' })
  @Matches(/^[A-Za-z0-9_]+$/, {
    message:
      'Slug can only contain letters (A-Z, a-z), numbers (0-9), and underscores (_)',
  })
  slug: string;

  @Type(() => Number)
  @IsInt()
  topicId: number;

  @IsString()
  @IsOptional()
  websiteUrl: string;

  @IsIn(Object.values(PageCategoryEnum), {
    message: `Invalid category. Must be one of: ${Object.values(PageCategoryEnum).join(', ')}`,
  })
  category: PageCategoryType;

  @IsString()
  why: string;

  @IsString()
  how: string;

  @IsString()
  what: string;

  @IsNumber()
  @Type(() => Number)
  countryId: number;

  @IsNumber()
  @Type(() => Number)
  cityId: number;
}
