import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog Management | Sasasasa",
  description: "Manage your blog posts, categories, tags, and comments",
  robots: {
    index: false,
    follow: true,
  },
  openGraph: {
    title: "Blog Management | Sasasasa",
    description: "Manage your blog posts, categories, tags, and comments",
    type: "website",
  },
  keywords: [
    "blog",
    "posts",
    "categories",
    "tags",
    "comments",
    "dashboard",
    "sasasasa",
  ],
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-full">
      <div className="flex-1">
        <main className="h-full overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
