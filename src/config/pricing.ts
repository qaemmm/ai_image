// Pricing tiers and credit system configuration
export interface PricingPlan {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  yearlyDiscount: number; // percentage
  credits: number;
  features: string[];
  popular?: boolean;
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'basic',
    name: 'Basic',
    description: 'Perfect for individuals and light users',
    monthlyPrice: 12,
    yearlyPrice: 115, // 20% off from $144
    yearlyDiscount: 20,
    credits: 150,
    features: [
      '150 credits per month',
      'Image compression',
      'Background removal (50 images/month)',
      'Image recognition',
      'AI image generation (30 images/month)',
      'Basic support',
      'JPG/PNG downloads',
      'Commercial use license',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'For professional creators and teams',
    monthlyPrice: 29,
    yearlyPrice: 278, // 20% off from $348
    yearlyDiscount: 20,
    credits: 400,
    popular: true,
    features: [
      '400 credits per month',
      'All Basic features',
      'Background removal (133 images/month)',
      'AI image generation (80 images/month)',
      'Priority generation queue',
      'Priority support',
      'JPG/PNG/WebP downloads',
      'Batch processing',
      'Commercial use license',
    ],
  },
  {
    id: 'max',
    name: 'Max',
    description: 'Designed for large enterprises and studios',
    monthlyPrice: 59,
    yearlyPrice: 566, // 20% off from $708
    yearlyDiscount: 20,
    credits: 1000,
    features: [
      '1000 credits per month',
      'All Pro features',
      'Background removal (333 images/month)',
      'AI image generation (200 images/month)',
      'Fastest generation speed',
      'Dedicated account manager',
      'All format downloads',
      'Advanced batch processing',
      'API access',
      'Commercial use license',
    ],
  },
];

// Credit costs for each feature
export const CREDIT_COSTS = {
  compress: 1,
  removeBg: 3,
  recognize: 2,
  generate: 5,
} as const;

// FAQ data
export const FAQ_ITEMS = [
  {
    question: 'What are credits and how do they work?',
    answer:
      'Credits are used to access our AI features. Different features cost different amounts of credits (e.g., image compression costs 1 credit, AI generation costs 5 credits). Credits are automatically refilled at the start of each billing cycle.',
  },
  {
    question: 'Can I change my plan anytime?',
    answer:
      'Yes, you can upgrade or downgrade your plan at any time. Upgrades take effect immediately, while downgrades take effect at the next billing cycle.',
  },
  {
    question: 'Do unused credits roll over?',
    answer:
      'Monthly plan credits do not roll over to the next month. Yearly plan credits are valid for the entire subscription period. We recommend choosing a plan based on your actual usage needs.',
  },
  {
    question: 'What payment methods are supported?',
    answer:
      'We support credit cards, debit cards, and various other payment methods through our payment processor Creem. All payments are processed securely.',
  },
  {
    question: 'Can I get a refund?',
    answer:
      'We offer a 7-day money-back guarantee for all plans. If you\'re not satisfied with our service within the first 7 days, contact support for a full refund.',
  },
  {
    question: 'What happens if I run out of credits?',
    answer:
      'If you run out of credits before the end of your billing cycle, you can either upgrade to a higher plan or purchase additional credit packs. You\'ll be notified when your credits are running low.',
  },
];
