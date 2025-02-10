import { Type } from "class-transformer";
import { IsIn, IsNumber, IsOptional, Min } from "class-validator";
import { EventCategory } from "src/modules/db/schemas/schema";

export class GetEventsDto {
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    @IsOptional()
    pageNo: number = 0

    @IsIn(EventCategory.enumValues)
    @IsOptional()
    category: string
}