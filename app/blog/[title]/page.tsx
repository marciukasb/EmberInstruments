import { readAllPosts, readPostBySlug } from "../../utils/blog";
import BlogPost from "../../_components/BlogPost/BlogPost";

export const metadata = {
  title: "Post",
  description: "Latest post from Ember Instruments",
};

type PostProps = {
  params: {
    title: string;
  };
};

export async function generateStaticParams() {
  const posts = await readAllPosts();
  return posts.map((post) => ({ title: post.slug }));
}

const Post = async ({ params }: PostProps) => {
  const post = await readPostBySlug(params.title);

  if (!post) {
    return <main><p>Post not found</p></main>;
  }

  return (
    <main>
      <BlogPost
        title={post.title}
        date={post.date}
        description={post.description}
      />
    </main>
  );
};

export default Post;
