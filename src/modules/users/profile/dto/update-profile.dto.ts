import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  @MinLength(4)
  fullName: string;

  @IsOptional()
  @IsString()
  @MaxLength(400)
  bio: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  @MinLength(6)
  username: string;

  @IsOptional()
  @IsString()
  phoneNumber: string;
}
