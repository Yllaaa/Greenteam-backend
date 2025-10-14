export interface PageDetails {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  websiteUrl: string | null;
  why: string | null;
  what: string | null;
  how: string | null;
  avatar: string | null;
  cover: string | null;
  category: string | null;
  ownerId: string;
  createdAt: Date;

  // Relationship objects
  topic: {
    id: string;
    name: string;
  } | null;

  country: {
    id: string;
    nameEn: string;
    nameEs: string;
  } | null;

  city: {
    id: string;
    nameEn: string;
    nameEs: string;
  } | null;

  followersCount: number;
  isFollowing: boolean;
}
