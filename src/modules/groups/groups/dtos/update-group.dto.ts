import {
  IsNotEmpty,
  IsOptional,
  IsUUID,
  Length,
  IsEnum,
  IsInt,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateGroupDto {
  @Length(3, 255)
  @IsOptional()
  name?: string;

  @Length(3, 255)
  @IsOptional()
  description?: string;
}
