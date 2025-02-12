import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';

export class GetPostsDto {
  @IsOptional()
  mainTopicId: number;

  @IsOptional()
  subTopicId: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  page: number = 0;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit: number = 10;
}
