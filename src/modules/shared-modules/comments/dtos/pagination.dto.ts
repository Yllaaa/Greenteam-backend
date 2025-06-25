import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  IsUUID,
  MaxLength,
  IsInt,
  Min,
} from 'class-validator';

export class PaginationDto {
  @Type(() => Number)
  @IsInt()
  @Min(0)
  page: number = 0;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit: number = 10;
}
