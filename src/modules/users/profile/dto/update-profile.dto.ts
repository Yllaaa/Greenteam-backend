import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  fullName: string;

  @IsOptional()
  @IsString()
  @MaxLength(400)
  bio: string;

  @IsOptional()
  @IsString()
  username: string;

  @IsOptional()
  @IsString()
  phoneNumber: string;
}
