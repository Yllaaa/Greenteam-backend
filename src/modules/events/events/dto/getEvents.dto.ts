import { Transform, Type } from 'class-transformer';
import { Equals, IsIn, IsNumber, IsOptional, Min } from 'class-validator';
import { SQL } from 'drizzle-orm';
import {
  EventCategory,
  EventMode,
  eventModeEnum,
} from 'src/modules/db/schemas/schema';

export class GetEventsDto {
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  page: number = 0;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  limit: number = 10;

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

  @IsIn(EventCategory.enumValues)
  @IsOptional()
  category: SQL<'social' | 'volunteering&work' | 'talks&workshops'>;

  @IsIn(eventModeEnum.enumValues)
  @IsOptional()
  eventMode?: EventMode;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @Equals(true, { message: 'verified must be true if provided' })
  verified?: boolean;
}
