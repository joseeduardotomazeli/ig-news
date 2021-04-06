import { query as q } from 'faunadb';

import fauna from '../../../services/fauna';
import stripe from '../../../services/stripe';

async function saveSubscription(
  customerId: string,
  subscriptionId: string,
  createAction = false
) {
  const faunaUserRef = await fauna.query(
    q.Select(
      'ref',
      q.Get(q.Match(q.Index('user_by_stripe_customer_id'), customerId))
    )
  );

  const stripeSubscription = await stripe.subscriptions.retrieve(
    subscriptionId
  );

  const stripeSubscriptionData = {
    id: subscriptionId,
    userId: faunaUserRef,
    status: stripeSubscription.status,
    price_id: stripeSubscription.items.data[0].price.id,
  };

  if (createAction)
    return await fauna.query(
      q.Create('subscriptions', { data: stripeSubscriptionData })
    );

  await fauna.query(
    q.Replace(
      q.Select(
        'ref',
        q.Get(q.Match(q.Index('subscription_by_id'), subscriptionId))
      ),
      { data: stripeSubscriptionData }
    )
  );
}

export { saveSubscription };
