import { Metadata } from "next";
import BlogAnalytics from "@/components/blog/BlogAnalytics";

export const metadata: Metadata = {
  title: "Analytics | Blog Management",
  description: "View blog analytics and statistics.",
};

export default function AnalyticsPage() {
  return <BlogAnalytics />;
}
