interface CommentAuthor {
  id: string;
  fullName: string;
  username: string;
  avatar: string | null;
}

interface CommentPost {
  id: string;
  mainTopicId: number;
}

interface Comment {
  id: string;
  content: string;
  mediaUrl: string | null;
  publicationId: string;
  createdAt: Date;
  author: CommentAuthor;
  post: CommentPost;
}
