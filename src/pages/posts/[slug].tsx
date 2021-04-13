import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { Session } from 'next-auth';
import { getSession } from 'next-auth/client';
import { RichText } from 'prismic-dom';

import getPrismic from '../../services/prismic';

import styles from './post.module.scss';

interface Post {
  slug: string;
  title: string;
  content: string;
  updatedAt: string;
}

interface PostProps {
  post: Post;
}

interface AppSession extends Session {
  activeSubscription: boolean;
}

function Post(props: PostProps) {
  const { post } = props;

  return (
    <>
      <Head>
        <title>{post.title} | ig-news</title>
      </Head>

      <main className={styles.postContainer}>
        <article className={styles.post}>
          <h1>{post.title}</h1>
          <time>{post.updatedAt}</time>

          <div
            className={styles.postContent}
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </article>
      </main>
    </>
  );
}

const getServerSideProps: GetServerSideProps = async (context) => {
  const { req, params } = context;

  const session = (await getSession({ req })) as AppSession;

  if (!session?.activeSubscription)
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };

  const prismic = getPrismic(req);
  const response = await prismic.getByUID('posts', String(params.slug), {});

  const post = {
    slug: params.slug,
    title: RichText.asText(response.data.title),
    content: RichText.asHtml(response.data.content),
    updatedAt: new Date(response.last_publication_date).toLocaleDateString(
      'pt-BR',
      {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }
    ),
  };

  return {
    props: { post },
  };
};

export { getServerSideProps };

export default Post;
