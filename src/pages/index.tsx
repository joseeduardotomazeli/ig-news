import { GetStaticProps } from 'next';
import Head from 'next/head';

import SubscribeButton from '../components/SubscribeButton';

import stripe from '../services/stripe';

import styles from './home.module.scss';

interface HomeProps {
  product: {
    priceId: string;
    amount: number;
  };
}

function Home(props: HomeProps) {
  const { product } = props;

  return (
    <>
      <Head>
        <title>Home | ig.news</title>
      </Head>

      <main className={styles.homeContainer}>
        <section className={styles.homeHero}>
          <span>👏 Hey, welcome</span>

          <h1>
            News about <br />
            the <span>React</span> world.
          </h1>
          <p>
            Get access to all the publications <br />
            <span>for {product.amount} month</span>
          </p>

          <SubscribeButton />
        </section>

        <img src="/images/avatar.svg" alt="Girl coding" />
      </main>
    </>
  );
}

const getStaticProps: GetStaticProps = async () => {
  const price = await stripe.prices.retrieve('price_1IZhLrL3KvBFXFnER1CofGV5', {
    expand: ['product'],
  });

  const product = {
    priceId: price.id,
    amount: new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price.unit_amount / 100),
  };

  return {
    props: { product },
    revalidate: 60 * 60 * 24, //24 hours
  };
};

export { getStaticProps };

export default Home;
