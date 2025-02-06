import { IsOptional, IsString } from "class-validator";

export class GetPostsDto {
    @IsString()
    @IsOptional()
    mainTopic: string;

    @IsString()
    @IsOptional()
    subTopic: string;
}
