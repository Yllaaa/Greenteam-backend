interface Topic {
  id: number;
  name: string;
}

interface UserSeller {
  id: string;
  fullName: string;
  avatar: string | null;
}

interface PageSeller {
  id: string;
  name: string;
  avatar: string | null;
}

interface Product {
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
