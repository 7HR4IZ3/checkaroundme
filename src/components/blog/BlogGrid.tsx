"use client";

import { BlogCard } from "./BlogCard";

export function BlogGrid({ posts }: { posts: any[] }) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => (
        <BlogCard
          key={post.$id}
          post={post}
        />
      ))}
    </div>
  );
}
