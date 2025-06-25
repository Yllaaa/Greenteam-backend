interface Country {
  id: string;
  nameEn: string;
  nameEs: string;
}

interface TranslatedCountry {
  id: string;
  name: string;
}

interface City {
  id: string;
  name: string;
}

interface UserLocation {
  country: Country | null;
  city: City | null;
}

interface TranslatedUserLocation {
  country: TranslatedCountry | null;
  city: City | null;
}

// User profile interfaces
interface UserBase {
  id: string;
  fullName: string;
  username: string;
  avatar: string | null;
  cover: string | null;
  bio: string | null;
  joinedAt: Date;
}

interface UserWithRelations extends UserBase {
  isFollowing?: boolean;
  isFollower?: boolean;
  isBlocked?: boolean;
  location: UserLocation | null;
}

interface UserProfileWithTranslatedLocation extends UserBase {
  isFollowing?: boolean;
  isFollower?: boolean;
  isBlocked?: boolean;
  location: TranslatedUserLocation | null;
}

interface GetUserProfileResult {
  userData: UserProfileWithTranslatedLocation;
  userScore?: number;
  isMyProfile: boolean;
}

interface ProfileRepository {
  getUserByUsername(username: string): Promise<UserBase | null>;

  getUserProfile(
    id: string,
    currentUserId?: string,
  ): Promise<UserWithRelations | null>;

  getUserScore(userId: string): Promise<number>;
}

interface ProfileService {
  getUserProfile(
    id: string,
    currentUserId?: string,
  ): Promise<UserWithRelations>;

  getUserByUsername(
    username: string,
    userId: string,
  ): Promise<GetUserProfileResult>;
}
