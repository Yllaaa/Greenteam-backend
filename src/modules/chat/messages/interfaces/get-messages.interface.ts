interface User {
  id: string;
  fullName: string;
  avatar: string | null;
  username: string;
}

interface Page {
  id: string;
  name: string;
  avatar: string | null;
  username: string;
}

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderType: 'user' | 'page';
  content: string;
  mediaUrl: string | null;
  sentAt: Date;
  seenAt: Date | null;
  senderUser?: User;
  senderPage?: Page;
}
