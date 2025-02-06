import { IsEnum, IsNotEmpty, IsUrl } from "class-validator";
import { blogType } from "src/modules/db/schemas/schema";

export class BlogDto {
    @IsUrl()
    @IsNotEmpty()
    url: string;

    @IsEnum(blogType.enumValues)
    @IsNotEmpty()
    type: string;

    user_id: string;
}
