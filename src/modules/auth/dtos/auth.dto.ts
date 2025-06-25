import {
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
  ValidateIf,
} from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  username: string;
}

export class LoginDto {
  @IsString()
  identifier?: string;

  @IsString()
  @MinLength(8)
  password: string;
}
