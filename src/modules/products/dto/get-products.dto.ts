import { productMarketType } from './../../db/schemas/products/products';
import { IsIn, IsOptional, IsUUID } from "class-validator"

export class GetProductsDto{
    @IsUUID()
    @IsOptional()
    topic_id: string

    @IsUUID()
    @IsOptional()
    sub_topic_id: string

    @IsIn(productMarketType.enumValues)
    @IsOptional()
    market_type: typeof productMarketType.enumValues[number]
}