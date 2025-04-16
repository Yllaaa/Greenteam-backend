import { IsOptional, IsNumber, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

export class FilterUserCommentsDto {
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    limit?: number = 10;

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    page?: number = 1;

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    mainTopicId?: number;

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    subTopicId?: number;
}