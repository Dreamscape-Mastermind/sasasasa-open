import { BlogPostContent } from "@/components/blog/BlogPostContent";
import { Metadata } from "next";
import SectionContainer from "@/components/SectionContainer";
import { blogApi } from "@/lib/api/blogApiService";
import { notFound } from "next/navigation";

interface BlogPostPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  try {
    const response = await blogApi.getPost(params.slug);
    const post = response.result;

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
  try {
    const response = await blogApi.getPost(params.slug);
    const post = response.result;

    if (!post) {
      notFound();
    }

    return (
      <SectionContainer>
        <BlogPostContent post={post} />
      </SectionContainer>
    );
  } catch (error) {
    notFound();
  }
}
