import { IsOptional, IsInt, Min, IsEnum, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { SQL } from 'drizzle-orm';

export class GetForumPublicationsDto {
  @IsOptional()
  @IsEnum(['need', 'doubt', 'dream'])
  section?: SQL<'need' | 'doubt' | 'dream'> | undefined;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  mainTopicId?: number;

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
