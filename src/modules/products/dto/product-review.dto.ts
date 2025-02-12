import { Type } from "class-transformer"
import { IsBoolean, IsEmpty, IsNumber, IsString, IsUUID, Min } from "class-validator"

export class ProductReviewDto{
    @IsEmpty()
    user_id: string

    @IsUUID()
    product_id: string

    @Type(() => Number)
    @IsNumber()
    @Min(0)
    rating_value: number

    @IsString()
    review: string

    @Type(() => Boolean)
    @IsBoolean()
    is_unsustainable: boolean
}