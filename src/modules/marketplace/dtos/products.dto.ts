import { Type } from 'class-transformer';
import {
  IsOptional,
  IsString,
  IsNumber,
  IsBoolean,
  IsEnum,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  @Type(() => String)
  name: string;

  @IsString()
  @Type(() => String)
  @IsOptional()
  description: string;

  @IsNumber({}, { message: 'Price must be a number' })
  @Type(() => Number)
  price: number | string;

  @IsNumber()
  @Type(() => Number)
  topicId: number;

  @IsNumber()
  @Type(() => Number)
  countryId: number;

  @IsNumber()
  @Type(() => Number)
  cityId: number;
}
