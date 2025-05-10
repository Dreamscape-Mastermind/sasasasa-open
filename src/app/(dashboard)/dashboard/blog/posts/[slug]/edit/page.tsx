import { Metadata } from "next";
import { useBlogPost } from "@/lib/hooks/useBlog";
import BlogPostForm from "@/components/blog/BlogPostForm";

export const metadata: Metadata = {
  title: "Edit Blog Post | Dashboard",
  description: "Edit an existing blog post.",
};

interface EditBlogPostPageProps {
  params: {
    slug: string;
  };
}

export default function EditBlogPostPage({ params }: EditBlogPostPageProps) {
  const { data: post, isLoading } = useBlogPost(params.slug);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!post) {
    return <div>Post not found</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Blog Post</h1>
        <p className="text-muted-foreground">Edit your existing blog post.</p>
      </div>
      <BlogPostForm mode="edit" post={post} />
    </div>
  );
}
