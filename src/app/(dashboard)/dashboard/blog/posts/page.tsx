import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog Posts | Sasasasa",
  description: "Manage and create your blog posts.",
  keywords: ["blog", "posts", "dashboard", "sasasasa", "content"],
  robots: {
    index: false,
    follow: true,
  },
  openGraph: {
    title: "Blog Posts | Sasasasa",
    description: "Manage and create your blog posts.",
    type: "website",
  },
};

export default function BlogPosts() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold">Blog Posts</h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-200">
            Coming soon! We're working on bringing you a powerful blog post
            management system to create and organize your content.
          </p>
        </div>
      </div>
    </div>
  );
}
