import { loadStripe } from '@stripe/stripe-js';

async function getStripeJS() {
  const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_API_KEY);
  return stripe;
}

export default getStripeJS;
