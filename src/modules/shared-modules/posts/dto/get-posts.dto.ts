import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';

export class GetPostsDto {
  @IsInt()
  @IsOptional()
  mainTopicId: number;

  @IsInt()
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
