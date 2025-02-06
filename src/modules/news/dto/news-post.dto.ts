import { IsDate, IsDateString, IsNotEmpty, IsString, IsUrl } from "class-validator";

export class NewsPostDto {
    blog_id?: string;

    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsNotEmpty()
    content: string;

    @IsUrl()
    @IsNotEmpty()
    image: string;

    @IsUrl()
    @IsNotEmpty()
    url: string;

    @IsDate()
    @IsNotEmpty()
    published_at: Date;

    @IsString()
    @IsNotEmpty()
    author: string;

    published: boolean = false;
}
