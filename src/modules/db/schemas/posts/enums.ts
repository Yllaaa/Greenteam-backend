import { pgEnum } from 'drizzle-orm/pg-core';

export const postTypeEnum = pgEnum('post_type', ['post', 'poll', 'shared']);

export const visibilityLevelEnum = pgEnum('visibility_level', [
  'only_me',
  'friends',
  'public',
]);

export const creatorTypeEnum = pgEnum('creator_type', [
  'user',
  'page',
  'group_member',
]);

export const mediaTypeEnum = pgEnum('media_type', [
  'photo',
  'video',
  'document',
  'audio',
]);

export const reactionableTypeEnum = pgEnum('reactionable_type', [
  'post',
  'comment',
  'forum-question',
]);

export const reactionTypeEnum = pgEnum('reaction_type', [
  'like',
  'dislike',
  'do',
  'sign',
]);
