import { Type } from "class-transformer"
import { IsBoolean, IsEmpty, IsIn, IsNumber, IsString, IsUUID, Min } from "class-validator"
import { productMarketType } from "src/modules/db/schemas/products/products"

export class ProductDto{
    @IsEmpty()
    seller_id: string

    @IsEmpty()
    seller_type: string

    @IsString()
    name: string

    @IsString()
    description: string

    @Type(() => Number)
    @IsNumber()
    @Min(0)
    price: number

    @Type(() => Boolean)
    @IsBoolean()
    is_hidden: boolean

    @IsIn(productMarketType.enumValues)
    market_type: string

    @IsString()
    location: string

    @IsUUID()
    topic_id: string

    @IsUUID()
    sub_topic_id: string

}