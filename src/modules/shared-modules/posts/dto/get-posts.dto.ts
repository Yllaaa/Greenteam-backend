import { Type } from "class-transformer";
import { IsInt, IsOptional, IsString, Min } from "class-validator";

export class GetPostsDto {
    @IsString()
    @IsOptional()
    mainTopic: string;

    @IsString()
    @IsOptional()
    subTopic: string;

    @Type(() => Number)
    @IsInt()
    @Min(0)
    offset: number = 0;

    @Type(() => Number)
    @IsInt()
    @Min(1)
    limit: number = 10;
}
