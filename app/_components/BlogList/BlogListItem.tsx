import React from "react";
import Image from "next/image";
import styles from "./BlogListItem.module.scss";
import { BlogPost } from "@/app/types/BlogPost";
import Link from "next/link";

const BlogListItem = ({ slug, title, summary, date, topic, thumbnail }: BlogPost) => {
  return (
    <Link href={`/blog/${slug}`}>
      <div className={styles.blogItem}>
        {/* Left Column */}
        <div className={styles.blogItem__textColumn}>
          <h2 className={styles.blogItem__title}>{title}</h2>
          <p className={styles.blogItem__description}>{summary}</p>
          <div className={styles.blogItem__meta}>
            <span className={styles.blogItem__date}>{date}</span>
            <span className={styles.blogItem__tag}>{topic}</span>
          </div>
        </div>

        {/* Right Column (Image) */}
        <div className={styles.blogItem__imageColumn}>
          <Image
            src={thumbnail}
            alt={title}
            fill
            className={styles.blogItem__image}
          />
        </div>
      </div>
    </Link>
  );
};

export default BlogListItem;
