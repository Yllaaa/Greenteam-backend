import { IsEmail, IsOptional, IsPhoneNumber, IsString } from 'class-validator';

export class UpdatePageContactDto {
  @IsString()
  @IsOptional()
  name: string;

  @IsString()
  @IsOptional()
  title: string;

  @IsEmail()
  @IsOptional()
  email: string;

  @IsString()
  @IsOptional()
  phoneNum: string;
}
