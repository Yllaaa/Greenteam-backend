export interface Country {
  id: string;
  nameEn: string;
  nameEs: string;
}

export interface TranslatedCountry {
  id: string;
  name: string;
}

export interface City {
  id: string;
  name: string;
}

export interface UserLocation {
  country: Country | null;
  city: City | null;
}

export interface TranslatedUserLocation {
  country: TranslatedCountry | null;
  city: City | null;
}

// User profile interfaces
export interface UserBase {
  id: string;
  fullName: string;
  username: string;
  avatar: string | null;
  cover: string | null;
  bio: string | null;
  createdAt: Date;
}

export interface UserWithRelations extends UserBase {
  isFollowing?: boolean;
  isFollower?: boolean;
  isBlocked?: boolean;
  location: UserLocation | null;
}

export interface UserProfileWithTranslatedLocation extends UserBase {
  isFollowing?: boolean;
  isFollower?: boolean;
  isBlocked?: boolean;
  location: TranslatedUserLocation | null;
}

export interface GetUserProfileResult {
  userData: UserProfileWithTranslatedLocation;
  userScore?: number;
  isMyProfile: boolean;
}

export interface ProfileRepository {
  getUserByUsername(username: string): Promise<UserBase | null>;

  getUserProfile(
    id: string,
    currentUserId?: string,
  ): Promise<UserWithRelations | null>;

  getUserScore(userId: string): Promise<number>;
}

export interface ProfileService {
  getUserProfile(
    id: string,
    currentUserId?: string,
  ): Promise<UserWithRelations>;

  getUserByUsername(
    username: string,
    userId: string,
  ): Promise<GetUserProfileResult>;
}
