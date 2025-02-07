import { IsOptional, IsInt, Min, IsEnum, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

export enum ForumSection {
  DOUBT = 'doubt',
  NEED = 'need',
  DREAM = 'dream',
}

export class GetForumPublicationsDto {
  @IsOptional()
  @IsEnum(ForumSection)
  section?: ForumSection;

  @IsOptional()
  @IsUUID()
  mainTopicId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;
}
