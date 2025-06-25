import { SQL } from 'drizzle-orm';
import { EventMode } from 'src/modules/db/schemas/schema';

type EventCategory = 'social' | 'volunteering&work' | 'talks&workshops';

export interface EventResponse {
  id: string;
  title: string;
  description: string;
  location: string;
  startDate: Date;
  endDate: Date;
  category: EventCategory;
  mode: EventMode;
  poster: string | null;
  hostedBy: SQL<'Global' | 'Greenteam' | 'user' | 'page'>;
  groupId: string | null;
  priority: number;
  isJoined?: boolean;
  creatorId: string;
  creatorType: 'user' | 'page' | 'group';
  userCreator?: {
    id: string;
    fullName: string;
  };
  pageCreator?: {
    id: string;
    name: string;
  };
}
