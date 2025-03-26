import { Type } from 'class-transformer';
import { IsDate, IsIn, IsOptional, IsString, IsUUID } from 'class-validator';
import { SQL } from 'drizzle-orm';
import { CreatorType, EventCategory } from 'src/modules/db/schemas/schema';

export class CreateEventDto {
  @IsIn(['user', 'page'])
  creatorType: CreatorType;

  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsString()
  location: string;

  @Type(() => Date)
  @IsDate()
  startDate: Date;

  @Type(() => Date)
  @IsDate()
  endDate: Date;

  @IsIn(EventCategory.enumValues)
  category: SQL<'social' | 'volunteering&work' | 'talks&workshops'>;

  @IsUUID()
  @IsOptional()
  groupId?: string;
}
