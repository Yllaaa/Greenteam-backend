import {
  IsOptional,
  IsString,
  IsInt,
  Min,
  ValidateNested,
  IsDate,
} from 'class-validator';
import { Type } from 'class-transformer';

class CursorDto {
  @IsString()
  id: string;

  @IsDate()
  @Type(() => Date)
  sentAt: Date;
}

export class GetMessagesDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => CursorDto)
  cursor?: CursorDto;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  limit?: number = 10;
}
