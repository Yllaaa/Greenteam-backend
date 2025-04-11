import { Type } from 'class-transformer';
import { IsString, IsOptional, Min } from 'class-validator';

export class GreenChallengePostDto {
  @IsString()
  content: string;
}
