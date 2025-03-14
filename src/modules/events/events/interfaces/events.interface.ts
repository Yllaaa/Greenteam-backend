import { SQL } from 'drizzle-orm';

type EventCategory = 'social' | 'volunteering&work' | 'talks&workshops';

export interface EventResponse {
  id: string;
  title: string;
  description: string;
  location: string;
  startDate: Date;
  endDate: Date;
  category: EventCategory;
  poster: string | null;
  hostedBy: SQL<'Global' | 'Greenteam' | 'user' | 'page'>;
  groupId: string | null;
  priority: number;
  isJoined?: boolean;
  userCreator?: {
    id: string;
    fullName: string;
  };
  pageCreator?: {
    id: string;
    name: string;
  };
}
