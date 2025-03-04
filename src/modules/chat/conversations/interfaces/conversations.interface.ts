interface UserContact {
  id: string;
  fullName: string;
  username: string;
  avatar: string | null;
  type: 'user';
}

interface PageContact {
  id: string;
  name: string;
  avatar: string | null;
  type: 'page';
}

type Contact = UserContact | PageContact;

interface LastMessage {
  id: string;
  content: string;
  sentAt: string;
}

interface Conversation {
  id: string;
  unreadCount: number;
  contact: Contact;
  lastMessage?: LastMessage;
}
