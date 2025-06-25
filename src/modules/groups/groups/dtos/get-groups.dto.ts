import {
  IsNotEmpty,
  IsOptional,
  IsUUID,
  Length,
  IsEnum,
  IsInt,
  Min,
  IsNumber,
  Equals,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class GetAllGroupsDtos {
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

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  countryId: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  cityId: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  topicId?: number;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @Equals(true, { message: 'verified must be true if provided' })
  verified?: boolean;
}
