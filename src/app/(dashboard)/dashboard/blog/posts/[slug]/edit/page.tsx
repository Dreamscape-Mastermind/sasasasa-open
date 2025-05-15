import BlogPostForm from "@/components/blog/BlogPostForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Edit Blog Post | Dashboard",
  description: "Edit an existing blog post.",
};

interface EditBlogPostPageProps {
  params: {
    slug: string;
  };
}

export default async function EditBlogPostPage({
  params,
}: EditBlogPostPageProps) {
  const { slug } = await params;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Blog Post</h1>
        <p className="text-muted-foreground">Edit your existing blog post.</p>
      </div>
      <BlogPostForm mode="edit" slug={slug} />
    </div>
  );
}
