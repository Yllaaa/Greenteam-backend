import { Type } from 'class-transformer';
import { IsIn, IsNumber, IsOptional, Min } from 'class-validator';
import { SQL } from 'drizzle-orm';
import { EventCategory } from 'src/modules/db/schemas/schema';

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
}
