import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog Comments | Sasasasa",
  description: "Manage and moderate comments on your blog posts.",
  keywords: ["blog", "comments", "dashboard", "sasasasa", "moderation"],
  robots: {
    index: false,
    follow: true,
  },
  openGraph: {
    title: "Blog Comments | Sasasasa",
    description: "Manage and moderate comments on your blog posts.",
    type: "website",
  },
};

export default function BlogComments() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold">Blog Comments</h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-200">
            Coming soon! We're working on bringing you a powerful comment
            management system to moderate and organize your blog discussions.
          </p>
        </div>
      </div>
    </div>
  );
}
