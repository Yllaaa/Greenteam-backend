import { IsEnum, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateReportDto {
    @IsUUID()
    @IsNotEmpty()
    reportedId: string;

    @IsEnum(['user', 'page', 'post', 'group', 'forum_publication', 'comment', 'product', 'event'])
    @IsNotEmpty()
    reportedType: 'user' | 'page' | 'post' | 'group' | 'forum_publication' | 'comment' | 'product' | 'event';

    @IsString()
    @IsNotEmpty()
    reason: string;
}