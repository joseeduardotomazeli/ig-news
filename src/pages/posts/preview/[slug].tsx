import { useEffect } from 'react';
import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/client';
import { Session } from 'next-auth';
import { RichText } from 'prismic-dom';

import getPrismic from '../../../services/prismic';

import styles from '../post.module.scss';

interface PostPreview {
  slug: string;
  title: string;
  content: string;
  updatedAt: string;
}

interface PostPreviewProps {
  post: PostPreview;
}

interface AppSession extends Session {
  activeSubscription: boolean;
}

function PostPreview(props: PostPreviewProps) {
  const [session] = useSession();
  const router = useRouter();

  const { post } = props;

  const appSession = session as AppSession;

  useEffect(() => {
    if (appSession?.activeSubscription) router.push(`/posts/${post.slug}`);
  }, [session]);

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
            className={`${styles.postContent} ${styles.preview}`}
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          <div className={styles.continueReading}>
            Wanna continue reading?
            <Link href="/">
              <a>Subscribe now 🤗</a>
            </Link>
          </div>
        </article>
      </main>
    </>
  );
}

const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: 'blocking',
  };
};

const getStaticProps: GetStaticProps = async (context) => {
  const { params } = context;

  const prismic = getPrismic();
  const response = await prismic.getByUID('posts', String(params.slug), {});

  const post = {
    slug: params.slug,
    title: RichText.asText(response.data.title),
    content: RichText.asHtml(response.data.content.splice(0, 3)),
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
    revalidate: 60 * 30, //30 minutes
  };
};

export { getStaticPaths, getStaticProps };

export default PostPreview;
