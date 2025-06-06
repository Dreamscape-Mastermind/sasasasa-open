import { Metadata } from "next";
import BlogPostForm from "@/components/blog/BlogPostForm";

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
