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

export class CreateGroupDto {
  @IsNotEmpty()
  topicId: number;

  @Length(3, 255)
  @IsNotEmpty()
  name: string;

  @Length(3, 255)
  @IsNotEmpty()
  description: string;

  @IsOptional()
  cover?: string;

  @IsEnum(['PUBLIC', 'PRIVATE'])
  @IsOptional()
  privacy?: 'PUBLIC' | 'PRIVATE';
}
