import BlogPost from '../../_components/BlogPost/BlogPost';
import { readAllPosts, readPostBySlug } from '../../utils/blog';
import { notFound } from 'next/navigation';

export const metadata = {
  title: 'Post',
  description: 'Latest post from Ember Instruments',
};

type PostProps = {
  params: { slug: string };
};

export async function generateStaticParams() {
  const posts = await readAllPosts();
  return posts.map(post => ({ slug: post.slug }));
}

export default async function Post({ params }: PostProps) {
  const post = await readPostBySlug(params.slug);
  if (!post) notFound();
  return (
    <main>
      <BlogPost
        title={post.title}
        date={post.date}
        description={post.description}
      />
    </main>
  );
}
