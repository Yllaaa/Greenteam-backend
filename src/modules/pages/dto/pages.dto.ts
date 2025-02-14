import { IsIn, IsString, IsUUID } from "class-validator";
import { pageCategory } from "src/modules/db/schemas/schema";

export class PageDto{
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

    @IsUUID()
    topic_id: string;

    @IsIn(pageCategory.enumValues)
    category: string;

    page_info_id: string
}