interface CommentAuthor {
  id: string;
  fullName: string;
  username: string;
  avatar: string | null;
}

interface Comment {
  id: string;
  content: string;
  mediaUrl: string | null;
  publicationId: string;
  createdAt: Date;
  author: CommentAuthor;
}
