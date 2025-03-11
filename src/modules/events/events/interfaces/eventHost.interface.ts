interface EventHost {
  hostedBy: string;
  userCreator?: {
    id: string;
    fullName: string;
    username: string;
    avatar: string | null;
  } | null;
  pageCreator?: {
    id: string;
    name: string;
    avatar: string | null;
  } | null;
}
