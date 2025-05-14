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
  LOCAL = 'local',
  ONLINE = 'online',
}

export class CreateProductDto {
  @IsString()
  @Type(() => String)
  name: string;

  @IsString()
  @IsOptional()
  @Type(() => String)
  description: string;

  @IsNumber({}, { message: 'Price must be a number' })
  @Type(() => Number)
  price: number | string;

  @IsEnum(MarketTypeEnum, {
    message: 'marketType must be either online or local',
  })
  marketType: MarketType;

  @IsNumber()
  @Type(() => Number)
  topicId: number;
}
