import Parser from "rss-parser";
import BlogList from "../_components/BlogList/BlogList";
import { BlogPost } from "../types/BlogPost";
import { formatDate } from "../utils";

export const metadata = {
  title: "Blog",
  description: "Latest posts from Ember Instruments",
};

async function fetchBlogPosts(): Promise<Array<BlogPost>> {
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
    } as BlogPost;
  });
}

export default async function Blog() {
  const posts = await fetchBlogPosts();

  return (
    <main>
      <h1>Blog</h1>
      <BlogList posts={posts} />
    </main>
  );
}
