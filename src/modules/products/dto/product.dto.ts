import { Transform, Type } from "class-transformer"
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

    @Transform(({ value }) => {
        if (value == 'true' || value == '1') return true;
        return false;
        })
    @IsBoolean()
    is_hidden: boolean

    @IsIn(productMarketType.enumValues)
    market_type: string

    @IsString()
    location: string

    @Type(() => Number)
    @IsNumber()
    topic_id: number

    @Type(() => Number)
    @IsNumber()
    sub_topic_id: number

}