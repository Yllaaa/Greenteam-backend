import { Transform, Type } from "class-transformer"
import { IsBoolean, IsEmpty, IsNumber, IsString, IsUUID, Max, Min } from "class-validator"

export class ProductReviewDto{
    @IsEmpty()
    user_id: string

    @IsUUID()
    product_id: string

    @Type(() => Number)
    @IsNumber()
    @Min(0)
    @Max(10)
    rating_value: number

    @IsString()
    review: string

    @Transform(({ value }) => {
        if (value == 'true' || value == '1') return true;
        return false;
        })
    @IsBoolean()
    is_unsustainable: boolean
}