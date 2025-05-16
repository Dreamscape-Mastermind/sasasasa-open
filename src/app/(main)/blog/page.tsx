import BlogContent from "@/components/blog/BlogContent";
import type { Metadata } from "next";
import Spinner from "@/components/ui/spiner";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Blog | SASASASA",
  description:
    "Read our latest blog posts about events, entertainment, and more.",
};

export default function BlogPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <BlogContent />
    </Suspense>
  );
}
