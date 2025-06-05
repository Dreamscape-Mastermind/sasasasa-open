import { BlogPostContent } from "@/components/blog/BlogPostContent";
import { Metadata } from "next";
import Spinner from "@/components/ui/spinner";
import { Suspense } from "react";
import { blogService } from "@/services/blog.service";

interface BlogPostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const postResponse = await blogService.getPost(slug);

    const post = postResponse.result;

    if (!post) {
      return {
        title: "Post Not Found | SASASASA",
      };
    }

    return {
      title: `${post.title} | SASASASA Blog`,
      description: post.excerpt,
      openGraph: {
        title: post.title,
        description: post.excerpt,
        type: "article",
        publishedTime: post.publish_date || undefined,
        authors: [post.author_name],
        images: post.featured_image ? [post.featured_image] : [],
      },
    };
  } catch (error) {
    return {
      title: "Post Not Found | SASASASA",
    };
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;

  return (
    <Suspense fallback={<Spinner />}>
      <BlogPostContent slug={slug} />
    </Suspense>
  );
}
