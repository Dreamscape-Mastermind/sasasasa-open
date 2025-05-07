import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog Analytics | Sasasasa",
  description: "View detailed analytics for your blog posts and content.",
  keywords: ["blog", "analytics", "dashboard", "sasasasa", "statistics"],
  robots: {
    index: false,
    follow: true,
  },
  openGraph: {
    title: "Blog Analytics | Sasasasa",
    description: "View detailed analytics for your blog posts and content.",
    type: "website",
  },
};

export default function BlogAnalytics() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold">Blog Analytics</h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-200">
            Coming soon! We're working on bringing you detailed analytics for
            your blog content.
          </p>
        </div>
      </div>
    </div>
  );
}
