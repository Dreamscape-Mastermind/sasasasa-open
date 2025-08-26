"use client";

import { CommentSection } from "@/components/blog/CommentSection";
import { ReactionButtons } from "@/components/blog/ReactionButtons";
import { notFound } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useBlog } from "@/hooks/useBlog";
import { useEffect } from "react";
import { useReactions } from "@/hooks/useReactions";

interface BlogPostContentProps {
  slug: string;
}

export function BlogPostContent({ slug }: BlogPostContentProps) {
  const { usePost, useIncrementViewCount } = useBlog();
  const { data: post, isLoading, error } = usePost(slug);
  const { mutate: incrementViewCount } = useIncrementViewCount();
  const { user, isAuthenticated } = useAuth();
  const {
    handleReactionSuccess,
    handleReactionUpdate,
    handleReactionRemove,
    getReactionsRecord,
  } = useReactions({
    queryKey: ["post", slug],
    id: slug,
  });

  // Increment view count only once when post is loaded
  useEffect(() => {
    if (slug) {
      incrementViewCount(slug);
    }
  }, [slug]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error || !post?.result) {
    notFound();
  }

  const postData = post.result;

  // Get user's reaction only if they are authenticated
  const userReaction = isAuthenticated
    ? postData.reactions?.find((reaction) => reaction.user === user?.id)
    : undefined;
  const userReactionId = userReaction?.id;
  const userReactionType = userReaction?.reaction_type;

  // Convert reactions array to record
  const reactionsRecord = getReactionsRecord(postData.reactions);

  return (
    <article className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
      <header className="py-12">
        {postData.featured_image && (
          <img
            src={postData.featured_image}
            alt={postData.title}
            className="mb-8 aspect-video w-full rounded-lg object-cover"
          />
        )}
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          {postData.title}
        </h1>
        <div className="mt-4 flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
          <span>By {postData.author_name}</span>
          <span>•</span>
          <time dateTime={postData.publish_date || postData.created_at || ""}>
            {new Date(
              postData.publish_date || postData.created_at || ""
            ).toLocaleDateString()}
          </time>
          <span>•</span>
        </div>
      </header>

      <div className="prose prose-lg dark:prose-invert">
        <div dangerouslySetInnerHTML={{ __html: postData.content }} />
      </div>

      <div className="mt-12 border-t border-gray-200 dark:border-gray-800 pt-8">
        <ReactionButtons
          postSlug={postData.slug}
          reactions={reactionsRecord}
          userReaction={userReactionType}
          userReactionId={userReactionId}
          onReactionSuccess={handleReactionSuccess}
          onReactionUpdate={handleReactionUpdate}
          onReactionRemove={handleReactionRemove}
        />
      </div>

      <div className="mt-12 border-t border-gray-200 dark:border-gray-800 pt-8">
        <CommentSection postId={postData.id.toString()} />
      </div>
    </article>
  );
}
