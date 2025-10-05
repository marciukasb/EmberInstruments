import Parser from "rss-parser";
import { BlogPost as BlogPostType } from "../../types/BlogPost";
import { formatDate } from "../../utils";
import BlogPost from "../../_components/BlogPost/BlogPost";
import { GetServerSideProps } from "next";

export const metadata = {
  title: "Post",
  description: "Latest post from Ember Instruments",
};

async function fetchBlogPost(title: string): Promise<BlogPostType> {
  const parser = new Parser();
  const feed = await parser.parseURL(
    "http://emberinstruments.siteleaf.net/feed.xml"
  );

  const posts = feed.items.map((item) => {
    let description =
      item.content || item.contentSnippet || item.description || "";
    description = description.replace(
      /"thumbnail":\s*"\/uploads\//,
      `"thumbnail": "http://emberinstruments.siteleaf.net/uploads/`
    );
    description = description.replace(
      /src="\/uploads/g,
      'class="blog-image" src="http://emberinstruments.siteleaf.net/uploads'
    );

    const startWord = "<Metadata>";
    const endWord = "</Metadata>";

    const startIndex = description.indexOf(startWord) + startWord.length;
    const endIndex = description.indexOf(endWord, startIndex);

    const metadataString = description.substring(startIndex, endIndex).trim();

    console.log("metadataString:", metadataString);
    let metadata = JSON.parse(metadataString) as any;

    return {
      title: item.title,
      thumbnail: metadata.thumbnail,
      summary: metadata.summary,
      description,
      topic: item.category || (item.categories && item.categories[0]),
      date: formatDate(item.pubDate),
    } as BlogPostType;
  });

  return posts.find((post) => post.title === title)!;
}

// export const getServerSideProps: GetServerSideProps = async (context) => {
//   const { title } = context.params!;
//   console.log("Fetching post with title:", title);

//   const post = await fetchBlogPost(title as string);

//   return {
//     props: {
//       title: post.title,
//       date: post.date,
//       description: post.description,
//     },
//   };
// };

type PostProps = {
  params: {
    title: string;
  };
};

async function getAllPosts(): Promise<Array<BlogPostType>> {
  const parser = new Parser();
  const feed = await parser.parseURL(
    "http://emberinstruments.siteleaf.net/feed.xml"
  );

  return feed.items.map((item) => {
    let description =
      item.content || item.contentSnippet || item.description || "";
    description = description.replace(
      /"thumbnail":\s*"\/uploads\//,
      `"thumbnail": "http://emberinstruments.siteleaf.net/uploads/`
    );
    description = description.replace(
      /src="\/uploads/g,
      'class="blog-image" src="http://emberinstruments.siteleaf.net/uploads'
    );

    const startWord = "<Metadata>";
    const endWord = "</Metadata>";

    const startIndex = description.indexOf(startWord) + startWord.length;
    const endIndex = description.indexOf(endWord, startIndex);

    const metadataString = description.substring(startIndex, endIndex).trim();

    let metadata = JSON.parse(metadataString) as any;

    return {
      title: item.title,
      thumbnail: metadata.thumbnail,
      summary: metadata.summary,
      description,
      topic: item.category || (item.categories && item.categories[0]),
      date: formatDate(item.pubDate),
    } as BlogPostType;
  });
}

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((post) => ({ title: post.title.replace(" ", "%20") }));
}

const Post = async ({ params }: PostProps) => {
  console.log("Fetching post with title:", params.title);

  const post = await fetchBlogPost(params.title.replace("%20", " ") as string);

  console.log("Rendering post with title:", params.title);
  return (
    <main>
      <BlogPost
        title={params.title}
        date={post.date}
        description={post.description}
      />
    </main>
  );
};

export default Post;
