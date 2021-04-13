import { Session } from 'next-auth';
import { useSession, signIn } from 'next-auth/client';
import { useRouter } from 'next/router';

import api from '../../services/api';
import getStripeJS from '../../services/stripe-js';

import styles from './styles.module.scss';

interface AppSession extends Session {
  activeSubscription: boolean;
}

function SubscribeButton() {
  const [session] = useSession();
  const router = useRouter();

  const appSession = session as AppSession;

  async function handleSubscribe() {
    if (!session) {
      signIn('github');
      return;
    }

    if (appSession.activeSubscription) {
      router.push('/posts');
      return;
    }

    try {
      const response = await api.post('/subscribe');
      const { sessionId } = response.data;

      const stripe = await getStripeJS();
      await stripe.redirectToCheckout({ sessionId });
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <button
      type="button"
      className={styles.subscribeButton}
      onClick={handleSubscribe}
    >
      Subscribe now
    </button>
  );
}

export default SubscribeButton;
