export class PageProfileDto {
  pageInfo: {
    id: string;
    name: string;
    description: string;
    avatar: string;
    cover: string;
    category: string;
    why: string;
    how: string;
    what: string;
    topic: {
      id: number;
      name: string;
    };
    owner: {
      id: string;
      fullName: string;
      avatar: string;
    };
    contacts: Array<{
      name: string;
      title: string;
      email: string;
      phone_num: string;
    }>;
    followersCount: number;
  };
}
