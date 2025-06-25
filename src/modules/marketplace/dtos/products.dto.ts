import { Type } from 'class-transformer';
import {
  IsOptional,
  IsString,
  IsNumber,
  IsBoolean,
  IsEnum,
  IsIn,
} from 'class-validator';
import { MarketType } from 'src/modules/db/schemas/products/products';

export enum MarketTypeEnum {
  LOCAL = 'local',
  ONLINE = 'online',
}

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

  @IsOptional()
  @IsIn(Object.values(MarketTypeEnum), {
    message: `Invalid marketType. Must be one of: ${Object.values(MarketTypeEnum).join(', ')}`,
  })
  marketType: MarketType;
}
