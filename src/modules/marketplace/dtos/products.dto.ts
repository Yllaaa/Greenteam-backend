import {
  IsOptional,
  IsString,
  IsNumber,
  IsBoolean,
  IsEnum,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsNumber({}, { message: 'Price must be a number' })
  price: number | string;

  @IsNumber()
  topicId: number;

  @IsNumber()
  countryId: number;

  @IsNumber()
  districtId: number;
}
