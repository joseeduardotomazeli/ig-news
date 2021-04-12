import Prismic from '@prismicio/client';

function getPrismic(request?: unknown) {
  const prismic = Prismic.client(process.env.PRISMIC_URL, {
    req: request,
    accessToken: process.env.PRISMIC_KEY,
  });

  return prismic;
}

export default getPrismic;
