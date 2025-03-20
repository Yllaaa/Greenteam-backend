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
  TierBenefits: TierBenefit[];
}
