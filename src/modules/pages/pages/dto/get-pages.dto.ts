import { IsOptional, IsNumberString, Equals } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class GetAllPagesDto {
  @IsOptional()
  @IsNumberString()
  countryId?: number;

  @IsOptional()
  @IsNumberString()
  cityId?: number;

  @IsOptional()
  @Type(() => Number)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  limit: number = 10;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @Equals(true, { message: 'verified must be true if provided' })
  verified?: boolean;
}
