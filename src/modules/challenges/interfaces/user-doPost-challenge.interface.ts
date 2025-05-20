import { UserChallengeStatus } from 'src/modules/db/schemas/schema';

export interface DoPostChallengeResult {
  id: string;
  postId: string;
  userId: string;
  status: UserChallengeStatus;
  post: {
    id: string;
    content: string;
    mainTopicId: number;
    mainTopic: {
      id: number;
      name: string;
    };
    subTopics: {
      topic: {
        id: number;
        name: string;
      };
    }[];
  };
}
