import { IsDate, IsDateString, IsNotEmpty, IsString, IsUrl } from "class-validator";
import { NewsPostInterface } from "../interfaces/news-post.interface";

export class NewsPostDto implements NewsPostInterface {
    blog_id: string;

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
}
