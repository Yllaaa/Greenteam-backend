import { IsNotEmpty, IsOptional, IsUUID, Length, IsEnum, IsInt, Min } from "class-validator";
import { Type } from 'class-transformer';

export class InsertGroupDto {
  @IsUUID()
  @IsNotEmpty()
  ownerId: string;

  @IsUUID()
  @IsNotEmpty()
  topicId: string;

  @Length(3, 255)
  @IsNotEmpty()
  name: string;

  @Length(3, 255)
  @IsNotEmpty()
  description: string;

  @IsOptional()
  cover?: string;

  @IsEnum(["PUBLIC", "PRIVATE"])
  @IsOptional()
  privacy?: "PUBLIC" | "PRIVATE";
}

export class UpdateGroupDto {
  @Length(3, 255)
  @IsOptional()
  name?: string;

  @Length(3, 255)
  @IsOptional()
  description?: string;

  @IsOptional()
  cover?: string;

  @IsEnum(["PUBLIC", "PRIVATE"])
  @IsOptional()
  privacy?: "PUBLIC" | "PRIVATE";
}



export class GetGroupDtos  {

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;
}
