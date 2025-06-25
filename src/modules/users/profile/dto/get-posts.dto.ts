import { IsOptional, IsNumber, IsUUID, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export class FilterGetPostsDto {
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  limit?: number = 10;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  mainTopicId: number;
}
