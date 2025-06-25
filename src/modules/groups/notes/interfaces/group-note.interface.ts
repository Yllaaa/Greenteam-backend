export interface GroupNote {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  creator: {
    id: string;
    fullName: string;
  };
}
