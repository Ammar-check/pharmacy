import Stripe from 'stripe';

// Lazy initialization - only check env var when stripe is actually used
let stripeInstance: Stripe | null = null;

function getStripe(): Stripe {
  if (!stripeInstance) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
    }
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-12-15.clover',
      typescript: true,
    });
  }
  return stripeInstance;
}

// Export a proxy that creates the stripe instance only when accessed
export const stripe = new Proxy({} as Stripe, {
  get: (target, prop) => {
    const stripeClient = getStripe();
    const value = (stripeClient as any)[prop];
    return typeof value === 'function' ? value.bind(stripeClient) : value;
  },
});
