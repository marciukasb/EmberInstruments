import React from "react";
import BlogListItem from "./BlogListItem";
import styles from "./BlogList.module.scss";
import { BlogPost } from "@/app/types/BlogPost";

interface BlogListProps {
  posts: BlogPost[];
}

const BlogList: React.FC<BlogListProps> = ({ posts }) => {
  return (
    <div className={styles.blogList}>
      {posts.map((post, index) => (
        <BlogListItem key={index} {...post} />
      ))}
    </div>
  );
};

export default BlogList;
