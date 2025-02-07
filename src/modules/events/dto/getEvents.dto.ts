import { Type } from "class-transformer";
import { IsNumber, IsOptional, Min } from "class-validator";

export class GetEventsDto {
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    @IsOptional()
    pageNo: number = 0
}