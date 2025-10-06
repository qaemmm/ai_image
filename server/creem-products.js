// Creem Product IDs Configuration
// Real product IDs from Creem Dashboard

export const CREEM_PRODUCTS = {
  basic: {
    monthly: 'prod_2cJDGzjStr2eTZgVx0xfGD',  // Basic Monthly - $12/month
    yearly: 'prod_46KCugbYjZn6nN5wDiDxbO',   // Basic Yearly - $115/year
  },
  pro: {
    monthly: 'prod_4BV6rfzTZBt37QapS6JPtj',  // Pro Monthly - $29/month
    yearly: 'prod_2WXLA8gc9V8fEBXEWwSF7X',   // Pro Yearly - $278/year
  },
  max: {
    monthly: 'prod_4fS2iV9lNqvL8Plt0jTDbS',  // Max Monthly - $59/month
    yearly: 'prod_2DhOx0qR8mHrfY0rhSpLC',    // Max Yearly - $566/year
  },
};

// Map plan ID and interval to product ID
export function getProductId(planId, interval) {
  const plan = CREEM_PRODUCTS[planId];
  if (!plan) {
    throw new Error(`Invalid plan ID: ${planId}`);
  }

  const productId = interval === 'year' ? plan.yearly : plan.monthly;
  if (!productId) {
    throw new Error(`Invalid interval: ${interval}`);
  }

  return productId;
}
