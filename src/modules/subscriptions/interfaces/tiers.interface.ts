interface SubscriptionBenefit {
  benefit: string;
}

interface TierBenefit {
  benefit: SubscriptionBenefit;
}

interface SubscriptionTier {
  id: number;
  name: string;
  price: number;
  isDirectlySubscriptable: boolean;
  TierBenefits: TierBenefit[];
}
