"use client";

import { BlogCard } from "@/components/blog/BlogCard";
import { useBlogPosts } from "@/lib/hooks/useBlog";

export default function BlogContent() {
  const { data: posts, isLoading } = useBlogPosts({ status: "PUBLISHED" });

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="py-12">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          Blog
        </h1>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
          Read our latest blog posts about events, entertainment, and more.
        </p>
      </div>

      {isLoading ? (
        <div>Loading posts...</div>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {posts?.results?.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
