import { MediaType } from 'src/modules/db/schemas/posts/enums';

// Define the possible section types
type Section = 'doubt' | 'need' | 'dream';

export type BaseQueryResult = {
  id: string;
  headline: string;
  content: string;
  section: Section;
  mediaUrl: string | null;
  createdAt: Date;
  author: {
    id: string;
    fullName: string;
    avatar: string | null;
    username: string;
  } | null;
  location: {
    country: {
      nameEn: string;
      nameEs: string;
      iso: string;
    };
    city: {
      nameEn: string;
    };
  } | null;
  media: Array<{
    id: string;
    mediaUrl: string;
    mediaType: MediaType;
  }>;
  commentCount: string | number;
  userReaction: string | null;
  dislikeCount: string | number;
  signCount?: string | number;
  likeCount?: string | number;
};

export type BasePublication = {
  id: string;
  headline: string;
  content: string;
  mediaUrl: string | null;
  createdAt: Date;
  author: {
    id: string;
    fullName: string;
    avatar: string | null;
    username: string;
  } | null;
  location: {
    country: {
      nameEn: string;
      nameEs: string;
      iso: string;
    };
    city: {
      nameEn: string;
    };
  } | null;
  media: Array<{
    id: string;
    mediaUrl: string;
    mediaType: MediaType;
  }>;
  commentCount: number;
  userReaction: string | null;
  dislikeCount: number;
};

type NeedPublication = BasePublication & {
  section: 'need';
  signCount: number;
};

type OtherPublication = BasePublication & {
  section: 'doubt' | 'dream';
  likeCount: number;
};

export type Publication = NeedPublication | OtherPublication;
