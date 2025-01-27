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

export const mainTopicsEnum = pgEnum('main_topics', [
  'food_and_health',
  'knowledge_and_values',
  'physical_and_mental',
  'community_and_nature',
  'art',
  'ecotechnics_bioconstruction',
]);

export const subTopicsEnum = pgEnum('sub_topics', [
  // Food and Health
  'cultivate',
  'cook',
  'keep',
  'natural_medicine',
  'nutrition',
  'hygiene',

  // Knowledge and Values
  'philosophy',
  'astronomy',
  'biology',
  'geology',
  'history',
  'psychology',
  'culture',
  'others',

  // Physical and Mental
  'exercise',
  'sports_games',
  'active_meditation',
  'passive_meditation',

  // Community and Nature
  'together',
  'nature',
  'volunteering',
  'ecotourism',

  // Art
  'crafts',
  'music',
  'show',

  // Ecotechnics and Bioconstruction
  'ecodesign_permaculture',
  'water_energy',
  'durable_tools',
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
