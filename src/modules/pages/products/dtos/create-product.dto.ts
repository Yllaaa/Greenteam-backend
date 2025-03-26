import { Type } from 'class-transformer';
import {
  IsOptional,
  IsString,
  IsNumber,
  IsBoolean,
  IsEnum,
} from 'class-validator';
import { MarketType } from 'src/modules/db/schemas/schema';

enum MarketTypeEnum {
  LOCAL_BUSINESS = 'local_business',
  VALUE_DRIVEN_BUSINESS = 'value_driven_business',
}

export class CreateProductDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsNumber({}, { message: 'Price must be a number' })
  @Type(() => Number)
  price: number | string;

  @IsEnum(MarketTypeEnum, {
    message:
      'marketType must be either local_business or value_driven_business',
  })
  marketType: MarketType;

  @IsNumber()
  topicId: number;
}
