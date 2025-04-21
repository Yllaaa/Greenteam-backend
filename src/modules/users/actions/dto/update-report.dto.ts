import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateReportDto {
    @IsEnum(['pending', 'resolved', 'ignored'])
    @IsNotEmpty()
    status: 'pending' | 'resolved' | 'ignored';

    @IsString()
    @IsOptional()
    adminNotes?: string;
}