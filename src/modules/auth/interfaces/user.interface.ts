export interface User {
  id: string;
  email: string;
  fullName: string | null;
  username: string;
  avatar: string | null;
  googleId: string | null;
  bio: string | null;
  isEmailVerified: boolean;
}
