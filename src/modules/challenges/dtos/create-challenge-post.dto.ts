import { Type } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

export class ChallengePostDto {
  @IsString()
  @IsNotEmpty()
  content: string;
}
