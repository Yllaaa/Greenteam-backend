export interface SubscriptionBenefit {
  benefitEn: string;
  benefitEs: string;
}

export interface TierBenefit {
  benefit: SubscriptionBenefit;
}

export interface SubscriptionTier {
  id: number;
  nameEn: string;
  nameEs: string;
  price: number;
  isDirectlySubscriptable: boolean;
  TierBenefits: TierBenefit[];
}
