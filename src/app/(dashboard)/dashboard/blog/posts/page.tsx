import { Metadata } from "next";
import BlogPosts from "@/components/blog/BlogPosts";

export const metadata: Metadata = {
  title: "Blog Management | Dashboard",
  description: "Manage your blog posts, comments, and analytics.",
};

export default function BlogManagementPage() {
  return <BlogPosts />;
}
