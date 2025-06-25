import { IsNotEmpty, IsUUID, IsIn } from 'class-validator';

export class CreateBlockDto {
  @IsUUID()
  @IsNotEmpty()
  blockedId: string;

  @IsNotEmpty()
  @IsIn(['user', 'page'])
  blockedEntityType: 'user' | 'page';
}