import { IsEnum, IsUUID } from 'class-validator';

export enum ReactionableTypeEnum {
  POST = 'post',
  COMMENT = 'comment',
  REPLY = 'reply',
  FORUM_PUBLICATION = 'forum_publication',
}

export enum ReactionTypeEnum {
  LIKE = 'like',
  DISLIKE = 'dislike',
  DO = 'do',
  SIGN = 'sign',
}

export class CreateReactionDto {
  @IsEnum(ReactionableTypeEnum)
  reactionableType: ReactionableTypeEnum;

  @IsUUID()
  reactionableId: string;

  @IsEnum(ReactionTypeEnum)
  reactionType: ReactionTypeEnum;
}
