import { IsInt, Min, IsNumber, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class GetNotificationsDto {
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @IsOptional()
  page: number = 0;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @IsOptional()
  limit: number = 10;
}
