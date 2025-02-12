import { Type } from 'class-transformer';
import { productMarketType } from './../../db/schemas/products/products';
import { IsIn, IsNumber, IsOptional } from "class-validator"

export class GetProductsDto{
    @Type(() => Number)
    @IsNumber()
    @IsOptional()
    topic_id: number

    @Type(() => Number)
    @IsNumber()
    @IsOptional()
    sub_topic_id: number

    @IsIn(productMarketType.enumValues)
    @IsOptional()
    market_type: typeof productMarketType.enumValues[number]
}