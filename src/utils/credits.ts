import { CREDIT_COSTS } from '../config/pricing';

export type FeatureType = keyof typeof CREDIT_COSTS;

export async function checkAndDeductCredits(
  userId: string,
  featureType: FeatureType
): Promise<{ success: boolean; error?: string; remaining?: number }> {
  try {
    const amount = CREDIT_COSTS[featureType];

    const response = await fetch('http://localhost:3001/api/credits/deduct', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        amount,
        type: featureType,
        description: `Used ${amount} credits for ${featureType}`,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Failed to deduct credits',
      };
    }

    return {
      success: true,
      remaining: data.remaining,
    };
  } catch (error) {
    console.error('Error deducting credits:', error);
    return {
      success: false,
      error: 'Network error occurred',
    };
  }
}
