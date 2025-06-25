interface SubscriptionBenefit {
  benefitEn: string;
  benefitEs: string;
}

interface TierBenefit {
  benefit: SubscriptionBenefit;
}

interface SubscriptionTier {
  id: number;
  nameEn: string;
  nameEs: string;
  price: number;
  isDirectlySubscriptable: boolean;
  TierBenefits: TierBenefit[];
}
