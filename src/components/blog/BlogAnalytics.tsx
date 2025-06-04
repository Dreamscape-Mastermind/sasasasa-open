"use client";

import { useBlogPosts } from "@/lib/hooks/useBlog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import dynamic from "next/dynamic";

const BlogAnalyticsChart = dynamic(
  () => import("@/components/blog/BlogAnalyticsChart"),
  { ssr: false }
);

export default function BlogAnalytics() {
  const { data: posts, isLoading } = useBlogPosts();

  if (isLoading) {
    return <div>Loading analytics...</div>;
  }

  const totalPosts = posts?.results.length || 0;
  const totalViews =
    posts?.results.reduce((sum, post) => sum + post.view_count, 0) || 0;
  const totalComments =
    posts?.results.reduce((sum, post) => sum + post.comment_count, 0) || 0;
  const totalReactions =
    posts?.results.reduce((sum, post) => sum + post.reaction_count, 0) || 0;

  const postsByStatus = posts?.results.reduce((acc, post) => {
    acc[post.status] = (acc[post.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const chartData = posts?.results
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    .slice(0, 10)
    .map((post) => ({
      title: post.title,
      views: post.view_count,
      comments: post.comment_count,
      reactions: post.reaction_count,
    }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Blog Analytics</h1>
        <p className="text-muted-foreground">
          View statistics and insights about your blog.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPosts}</div>
            <p className="text-xs text-muted-foreground">
              {postsByStatus?.PUBLISHED || 0} published,{" "}
              {postsByStatus?.DRAFT || 0} drafts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalViews}</div>
            <p className="text-xs text-muted-foreground">Across all posts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Comments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalComments}</div>
            <p className="text-xs text-muted-foreground">User engagement</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Reactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalReactions}</div>
            <p className="text-xs text-muted-foreground">User interactions</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top Posts</CardTitle>
          <CardDescription>
            Most viewed and engaged posts in the last 10 posts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <BlogAnalyticsChart data={chartData || []} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
