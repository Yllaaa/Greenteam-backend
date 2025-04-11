import { Type } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

export class GreenChallengePostDto {
  @IsString()
  @IsNotEmpty()
  content: string;
}
