import { Equals, IsEnum, IsIn, IsInt, IsOptional, Min } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export enum MarketType {
  LOCAL = 'local',
  ONLINE = 'online',
}

export class GetAllProductsDto {
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(1)
  topicId?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  countryId?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  cityId?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(1)
  page?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(1)
  limit?: number;

  @IsOptional()
  @IsIn(Object.values(MarketType), {
    message: `Invalid marketType. Must be one of: ${Object.values(MarketType).join(', ')}`,
  })
  marketType?: MarketType;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @Equals(true, { message: 'verified must be true if provided' })
  verified?: boolean;
}
