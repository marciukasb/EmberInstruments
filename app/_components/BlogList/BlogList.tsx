import React from "react";
import BlogListItem from "./BlogListItem";
import { BlogPost } from "@/app/types/BlogPost";

interface BlogListProps {
  posts: BlogPost[];
}

const BlogList: React.FC<BlogListProps> = ({ posts }) => {
  return (
    <div className="space-y-8">
      {posts.map((post, index) => (
        <BlogListItem key={index} {...post} />
      ))}
    </div>
  );
};

export default BlogList;
