import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";
import { BlogPostListItem } from "@/types/blog";
import Image from "next/image";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

interface BlogCardProps {
  post: BlogPostListItem;
}

export function BlogCard({ post }: BlogCardProps) {
  return (
    <Card className="overflow-hidden">
      <Link href={`/blog/${post.slug}`}>
        <div className="relative h-48 w-full">
          <Image
            src={post.featured_image}
            alt={post.title}
            fill
            className="object-cover"
          />
        </div>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Badge
              variant={post.status === "PUBLISHED" ? "default" : "secondary"}
            >
              {post.status}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {formatDate(post.publish_date)}
            </span>
          </div>
          <h3 className="line-clamp-2 text-xl font-semibold">{post.title}</h3>
        </CardHeader>
        <CardContent>
          <p className="line-clamp-3 text-muted-foreground">{post.excerpt}</p>
        </CardContent>
        <CardFooter className="flex items-center justify-between border-t px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              By {post.author_name}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {post.comment_count} comments
            </span>
            <span className="text-sm text-muted-foreground">
              {post.reaction_count} reactions
            </span>
          </div>
        </CardFooter>
      </Link>
    </Card>
  );
}
