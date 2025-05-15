"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useBlogComments, useCreateComment } from "@/lib/hooks/useBlog";

import { Button } from "@/components/ui/button";
import { Comment } from "@/types/blog";
import { ReactionButtons } from "./ReactionButtons";
import { Textarea } from "@/components/ui/textarea";
import { formatDate } from "@/lib/utils";
import { useAuth } from "@/context/auth-context";
import { useReactions } from "@/lib/hooks/useReactions";
import { useState } from "react";

interface CommentSectionProps {
  postId: string;
}

export function CommentSection({ postId }: CommentSectionProps) {
  const [content, setContent] = useState("");
  const { data: comments = [], isLoading } = useBlogComments({ post: postId });
  const { mutate: createComment, isPending: isSubmitting } = useCreateComment();
  const { user, isAuthenticated } = useAuth();
  const {
    handleReactionSuccess,
    handleReactionUpdate,
    handleReactionRemove,
    getReactionsRecord,
  } = useReactions({
    queryKey: ["blog-comments", { post: postId.toString() }],
    id: postId.toString(),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    createComment(
      {
        post: postId,
        content: content.trim(),
      },
      {
        onSuccess: () => {
          setContent("");
        },
      }
    );
  };

  const renderComment = (comment: Comment) => {
    // Get user's reaction only if they are authenticated
    const userReaction = isAuthenticated
      ? comment.reactions?.find((reaction) => reaction.user === user?.id)
      : undefined;
    const userReactionId = userReaction?.id;
    const userReactionType = userReaction?.reaction_type;

    // Convert reactions array to record
    const reactionsRecord = getReactionsRecord(comment.reactions);

    return (
      <div key={comment.id} className="space-y-4">
        <div className="flex gap-4">
          <Avatar>
            <AvatarImage
              src={`https://avatar.vercel.sh/${comment.author_name}`}
            />
            <AvatarFallback>{comment.author_name[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{comment.author_name}</p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(comment.created_at)}
                </p>
              </div>
              {!comment.is_approved && (
                <span className="text-sm text-yellow-600">
                  Pending approval
                </span>
              )}
            </div>
            <p className="text-sm">{comment.content}</p>

            {/* Add reaction buttons for comments */}
            <div className="mt-2">
              <ReactionButtons
                commentId={comment.id}
                reactions={reactionsRecord}
                userReaction={userReactionType}
                userReactionId={userReactionId}
                onReactionSuccess={(reaction) =>
                  handleReactionSuccess(reaction)
                }
                onReactionUpdate={(oldType, newType) =>
                  handleReactionUpdate(oldType, newType)
                }
                onReactionRemove={(type) => handleReactionRemove(type)}
              />
            </div>

            {comment.replies?.length > 0 && (
              <div className="ml-8 mt-4 space-y-4">
                {comment.replies.map(renderComment)}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return <div>Loading comments...</div>;
  }

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Textarea
          placeholder="Write a comment..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-[100px]"
        />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Posting..." : "Post Comment"}
        </Button>
      </form>

      <div className="space-y-8">
        <h3 className="text-lg font-semibold">{comments.length} Comments</h3>
        {comments.map(renderComment)}
      </div>
    </div>
  );
}
