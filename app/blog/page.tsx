import Parser from "rss-parser";
import style from "./blog.module.scss";

export const metadata = {
  title: "Blog",
  description: "Latest posts from Ember Instruments",
};

async function fetchBlogPosts() {
  const parser = new Parser();
  const feed = await parser.parseURL(
    "http://emberinstruments.siteleaf.net/feed.xml"
  );

  return feed.items.map((item) => {
    // Ensure images have absolute URLs
    let description =
      item.content || item.contentSnippet || item.description || "";
    description = description.replace(
      /src="\/uploads/g,
      'class="blog-image" src="http://emberinstruments.siteleaf.net/uploads'
    );

    description = description.replace(
      /src="\/uploads/g,
      'src="http://emberinstruments.siteleaf.net/uploads'
    );

    return {
      title: item.title,
      link: item.link,
      description,
      pubDate: item.pubDate,
    };
  });
}

export default async function Blog() {
  const posts = await fetchBlogPosts();

  return (
    <main>
      <h1>Blog</h1>
      <ul>
        {posts.map((post, index) => (
          <li key={index}>
            <h2>
              <a href={post.link} target="_blank" rel="noopener noreferrer">
                {post.title}
              </a>
            </h2>
            {/* Prevent hydration errors by ensuring safe HTML rendering */}
            <div
              dangerouslySetInnerHTML={{ __html: post.description }}
              suppressHydrationWarning={true}
            ></div>
            <small>{post.pubDate}</small>
          </li>
        ))}
      </ul>
    </main>
  );
}
