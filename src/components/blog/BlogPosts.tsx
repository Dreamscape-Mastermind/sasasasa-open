"use client";

import { Archive, Pencil, PlusCircle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { useBlogPosts } from "@/lib/hooks/useBlog";

export default function BlogPosts() {
  const { data: posts, isLoading } = useBlogPosts();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Blog Management</h1>
          <p className="text-muted-foreground">
            Manage your blog posts, comments, and analytics.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/blog/posts/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Post
          </Link>
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Published</TableHead>
              <TableHead>Views</TableHead>
              <TableHead>Comments</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  Loading posts...
                </TableCell>
              </TableRow>
            ) : (
              posts?.results.map((post) => (
                <TableRow key={post.id}>
                  <TableCell className="font-medium">
                    <Link
                      href={`/dashboard/blog/posts/${post.slug}`}
                      className="hover:underline"
                    >
                      {post.title}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        post.status === "PUBLISHED"
                          ? "default"
                          : post.status === "DRAFT"
                          ? "secondary"
                          : "destructive"
                      }
                    >
                      {post.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{post.author_name}</TableCell>
                  <TableCell>
                    {post.publish_date
                      ? formatDate(post.publish_date)
                      : "Not published"}
                  </TableCell>
                  <TableCell>{post.view_count}</TableCell>
                  <TableCell>{post.comment_count}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/dashboard/blog/posts/${post.slug}/edit`}>
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" asChild>
                        <Link
                          href={`/dashboard/blog/posts/${post.slug}/archive`}
                        >
                          <Archive className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
