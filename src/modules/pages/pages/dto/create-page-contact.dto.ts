import { IsEmail, IsPhoneNumber, IsString } from 'class-validator';

export class CreatePageContactDto {
  @IsString()
  name: string;

  @IsString()
  title: string;

  @IsEmail()
  email: string;

  @IsString()
  phoneNum: string;
}
