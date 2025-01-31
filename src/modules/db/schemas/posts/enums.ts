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

export const mediaParentTypeEnum = pgEnum('media_parent_type', [
  'post',
  'message',
]);

export const pollParentTypeEnum = pgEnum('media_parent_type', [
  'post',
  'message',
]);

export const sharedEntityTypeEnum = pgEnum('shared_entity_type', [
  'post',
  'product',
  'news',
  'event',
]);

export const likeableTypeEnum = pgEnum('likeable_type', [
  'post',
  'comment',
  'event',
  'product',
  'news',
]);
