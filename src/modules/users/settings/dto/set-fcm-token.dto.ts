import { IsNotEmpty, IsString } from 'class-validator';

export class SetFcmTokenDto {
  @IsNotEmpty()
  @IsString()
  fcmToken: string;
}
