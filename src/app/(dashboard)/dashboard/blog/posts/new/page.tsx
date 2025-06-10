import { Metadata } from "next";
import dynamic from 'next/dynamic';
import { Skeleton } from "@/components/ui/skeleton";

const BlogPostForm = dynamic(() => import("@/components/blog/BlogPostForm"), {
  loading: () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-32 w-full" />
      </div>
      <div className="flex gap-4">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  ),
});

export const metadata: Metadata = {
  title: "New Blog Post | Dashboard",
  description: "Create a new blog post.",
};

export default function NewBlogPostPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">New Blog Post</h1>
        <p className="text-muted-foreground">
          Create a new blog post for your website.
        </p>
      </div>
      <BlogPostForm mode="create" />
    </div>
  );
}
