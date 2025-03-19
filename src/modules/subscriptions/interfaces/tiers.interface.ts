interface SubscriptionBenefit {
  benefit: string;
}

interface TierBenefit {
  benefit: SubscriptionBenefit;
}

interface SubscriptionTier {
  id: string;
  name: string;
  price: number;
  TierBenefits: TierBenefit[];
}
