import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/client';
import { query as q } from 'faunadb';

import stripe from '../../services/stripe';
import fauna from '../../services/fauna';

interface User {
  ref: {
    id: string;
  };
  data: {
    stripe_customer_id: string;
  };
}

async function subscribe(request: NextApiRequest, response: NextApiResponse) {
  if (request.method === 'POST') {
    const session = await getSession({ req: request });

    const faunaUser = await fauna.query<User>(
      q.Get(q.Match(q.Index('user_by_email'), q.Casefold(session.user.email)))
    );

    let customerId = faunaUser.data.stripe_customer_id;

    if (!customerId) {
      const stripeCustomer = await stripe.customers.create({
        email: session.user.email,
      });

      await fauna.query(
        q.Update(q.Ref(q.Collection('users'), faunaUser.ref.id), {
          data: { stripe_customer_id: stripeCustomer.id },
        })
      );

      customerId = stripeCustomer.id;
    }

    const stripeCheckout = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      billing_address_collection: 'required',
      line_items: [{ price: 'price_1IZhLrL3KvBFXFnER1CofGV5', quantity: 1 }],
      mode: 'subscription',
      allow_promotion_codes: true,
      success_url: process.env.STRIPE_SUCCESS_URL,
      cancel_url: process.env.STRIPE_CANCEL_URL,
    });

    return response.status(200).json({ sessionId: stripeCheckout.id });
  }

  response.setHeader('Allow', 'POST');
  response.status(405).end('Method not allowed.');
}

export default subscribe;
