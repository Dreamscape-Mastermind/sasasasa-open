import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog Categories | Sasasasa",
  description: "Manage and organize your blog posts with categories.",
  keywords: ["blog", "categories", "dashboard", "sasasasa", "organization"],
  robots: {
    index: false,
    follow: true,
  },
  openGraph: {
    title: "Blog Categories | Sasasasa",
    description: "Manage and organize your blog posts with categories.",
    type: "website",
  },
};

export default function BlogCategories() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold">Blog Categories</h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-200">
            Coming soon! We're working on bringing you a powerful category
            management system to organize your blog content.
          </p>
        </div>
      </div>
    </div>
  );
}
