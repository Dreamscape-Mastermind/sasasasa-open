import { BlogPostContent } from "@/components/blog/BlogPostContent";
import { Metadata } from "next";
import SectionContainer from "@/components/SectionContainer";
import { blogApi } from "@/lib/api/blogApiService";

interface BlogPostPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  try {
    const post = await blogApi.getPost(params.slug);

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

export default function BlogPostPage({ params }: BlogPostPageProps) {
  return (
    <SectionContainer>
      <BlogPostContent slug={params.slug} />
    </SectionContainer>
  );
}
