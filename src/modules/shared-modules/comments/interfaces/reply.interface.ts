interface ReplyAuthor {
  id: string;
  fullName: string;
  username: string;
  avatar: string | null;
}

interface CommentReply {
  id: string;
  commentId: string;
  content: string;
  mediaUrl: string | null;
  createdAt: Date;
  author: ReplyAuthor;
}
