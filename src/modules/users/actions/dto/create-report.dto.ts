import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

export enum ReportedEntityType {
  USER = 'user',
  PAGE = 'page',
  POST = 'post',
  GROUP = 'group',
  FORUM_PUBLICATION = 'forum_publication',
  COMMENT = 'comment',
  PRODUCT = 'product',
  EVENT = 'event',
}

export class CreateReportDto {
  @IsUUID()
  @IsNotEmpty()
  reportedId: string;

  @IsEnum(ReportedEntityType)
  @IsNotEmpty()
  reportedType: ReportedEntityType;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  reason: string;
}
