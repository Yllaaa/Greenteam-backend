export interface Topic {
  id: number;
  name: string;
}

export interface UserSeller {
  id: string;
  fullName: string;
  avatar: string | null;
}

export interface PageSeller {
  id: string;
  name: string;
  avatar: string | null;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  marketType: string;
  sellerId: string;
  sellerType: string;
  countryId: number;
  districtId: number;
  topic: Topic;
  userSeller?: UserSeller | null;
  pageSeller?: PageSeller | null;
}
