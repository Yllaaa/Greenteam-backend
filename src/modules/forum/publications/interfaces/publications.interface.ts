// Define the possible section types
type Section = 'doubt' | 'need' | 'dream';

// Base type for the raw query result
type BaseQueryResult = {
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
  commentCount: string | number;
  userReaction: string | null;
  dislikeCount: string | number;
  signCount?: string | number;
  likeCount?: string | number;
};

// Refined types for the processed results
type BasePublication = {
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

type Publication = NeedPublication | OtherPublication;
