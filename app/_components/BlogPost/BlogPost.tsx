import React from "react";
import styles from "./BlogPost.module.scss";

type BlogPostProps = {
  title: string;
  date: string;
  description: string;
};

const BlogPost: React.FC<BlogPostProps> = ({ title, date, description }) => {
  return (
    <article className={styles.blogPost}>
      <h1 className={styles.title}>{title}</h1>

      <div
        className={styles.content}
        dangerouslySetInnerHTML={{ __html: description }}
      />
    </article>
  );
};

export default BlogPost;
