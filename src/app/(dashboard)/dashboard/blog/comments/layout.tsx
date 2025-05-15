import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Comments | Blog Management",
  description: "Manage and moderate blog post comments.",
};

export default function CommentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
