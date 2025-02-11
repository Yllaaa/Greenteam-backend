import { Type } from 'class-transformer';
import { IsDate, IsIn, IsOptional, IsString, IsUUID } from 'class-validator';
import { SQL } from 'drizzle-orm';
import { EventCategory } from 'src/modules/db/schemas/schema';

export class EventsDto {
  @IsUUID()
  @IsOptional()
  creatorId: string;

  @IsIn(['user', 'page'])
  creatorType: SQL<'user' | 'page'>;

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
  topicId: string;
}
