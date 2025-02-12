import {
  IsEnum,
  IsInt,
  IsString,
  IsUUID,
  Length,
  MinLength,
} from 'class-validator';
import { SQL } from 'drizzle-orm';
export enum ForumSection {
  DOUBT = 'doubt',
  NEED = 'need',
  DREAM = 'dream',
}

export class CreateForumPublicationDto {
  @IsString()
  @Length(5, 255)
  headline: string;

  @IsString()
  @MinLength(10)
  content: string;

  @IsInt()
  mainTopicId: number;

  @IsEnum(ForumSection)
  section: SQL<'doubt' | 'need' | 'dream'>;
}
