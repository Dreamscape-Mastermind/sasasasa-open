import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog Tags | Sasasasa",
  description: "Manage and organize your blog posts with tags.",
  keywords: ["blog", "tags", "dashboard", "sasasasa", "organization"],
  robots: {
    index: false,
    follow: true,
  },
  openGraph: {
    title: "Blog Tags | Sasasasa",
    description: "Manage and organize your blog posts with tags.",
    type: "website",
  },
};

export default function BlogTags() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold">Blog Tags</h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-200">
            Coming soon! We're working on bringing you a powerful tag management
            system to organize your blog content.
          </p>
        </div>
      </div>
    </div>
  );
}
