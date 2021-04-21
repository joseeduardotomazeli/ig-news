import { loadStripe } from '@stripe/stripe-js';

async function getStripeJS() {
  const stripe = await loadStripe(process.env.STRIPE_PUBLIC_KEY);
  return stripe;
}

export default getStripeJS;
