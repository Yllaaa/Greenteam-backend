// Create a DTO for page products
export class ProductDto {
    id: string;
    name: string;
    description: string;
    price: number;
    currency: string;
    imageUrl: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
  }
  
  // Create a DTO for page profile
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