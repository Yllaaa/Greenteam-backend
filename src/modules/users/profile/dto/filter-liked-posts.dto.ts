import { IsOptional, IsNumber, IsUUID, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { reactionTypeEnum } from '../../../db/schemas/posts/enums';

export class FilterLikedPostsDto {
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    limit?: number = 10;

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    page?: number = 1;

    @IsOptional()
    mainTopicId: number;

    @IsOptional()
    @IsEnum(reactionTypeEnum)
    reactionType?: string;
}
