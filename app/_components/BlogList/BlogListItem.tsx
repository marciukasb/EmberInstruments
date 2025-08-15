import React from "react";
import Image from "next/image";
import { BlogPost } from "@/app/types/BlogPost";

const BlogListItem: React.FC<BlogPost> = ({
  title,
  summary,
  date,
  topic,
  thumbnail,
}) => {
  return (
    <div className="grid grid-cols-3 gap-6 items-center">
      {/* Left Column */}
      <div className="col-span-2 flex flex-col justify-between h-full">
        <div>
          <h2 className="text-2xl font-bold mb-2">{title}</h2>
          <p className="text-gray-600 mb-4">{summary}</p>
        </div>
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>{date}</span>
          <span className="bg-gray-200 px-3 py-1 rounded-full text-gray-700">
            {topic}
          </span>
        </div>
      </div>

      {/* Right Column (Image) */}
      <div className="w-full aspect-square relative">
        <Image
          src={thumbnail}
          alt={title}
          fill
          className="object-cover rounded"
        />
      </div>
    </div>
  );
};

export default BlogListItem;
