import { Type } from "class-transformer";
import { IsIn, IsInt, IsString } from "class-validator";
import { pageCategory } from "src/modules/db/schemas/schema";

export class PageDto {
    owner_id: string

    @IsString()
    name: string;

    @IsString()
    description: string;

    @IsString()
    slug: string;

    @IsString()
    avatar: string;

    @IsString()
    cover: string;

    @Type(() => Number)
    @IsInt()
    topic_id: number;

    @IsIn(pageCategory.enumValues)
    category: string;

    page_info_id: string;

    @IsString()
    why: string;

    @IsString()
    how: string;

    @IsString()
    what: string;

}