import { NextApiRequest, NextApiResponse } from 'next';
import { Readable } from 'stream';
import Stripe from 'stripe';

import { saveSubscription } from './_lib/subscription';

import stripe from '../../services/stripe';

const config = {
  api: {
    bodyParser: false,
  },
};

const relevantEvents = new Set([
  'checkout.session.completed',
  'customer.subscription.updated',
  'customer.subscription.deleted',
]);

async function buffer(readable: Readable) {
  const chunks = [];

  for await (const chunk of readable)
    chunks.push(typeof chunk == 'string' ? Buffer.from(chunk) : chunk);

  return Buffer.concat(chunks);
}

async function webhooks(request: NextApiRequest, response: NextApiResponse) {
  if (request.method === 'POST') {
    const requestBuffer = await buffer(request);
    const stipeSignature = request.headers['stripe-signature'];

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        requestBuffer,
        stipeSignature,
        process.env.STRIPE_WEBHOOKS_SECRET
      );
    } catch (err) {
      return response.status(400).send(`Webhooks error: ${err.message}.`);
    }

    if (relevantEvents.has(event.type)) {
      try {
        switch (event.type) {
          case 'checkout.session.completed':
            const stripeCheckout = event.data.object as Stripe.Checkout.Session;

            await saveSubscription(
              String(stripeCheckout.customer),
              String(stripeCheckout.subscription),
              true
            );
            break;

          case 'customer.subscription.updated':
          case 'customer.subscription.deleted':
            const stripeSubscription = event.data.object as Stripe.Subscription;

            await saveSubscription(
              String(stripeSubscription.customer),
              String(stripeSubscription.id)
            );
            break;

          default:
            throw new Error('Unhandled event.');
        }
      } catch (err) {
        return response.json(`Webhooks error: ${err.message}.`);
      }
    }

    return response.json({ received: true });
  }

  response.setHeader('Allow', 'POST');
  response.status(405).end('Method not allowed.');
}

export { config };

export default webhooks;
